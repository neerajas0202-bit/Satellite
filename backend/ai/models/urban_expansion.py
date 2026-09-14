import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List
from backend.ai.models.base import BaseRemoteSensingModel
from backend.ai.models.vectorizer import vectorizer

class BuiltUpCNN(nn.Module):
    """
    Convolutional feature extractor for urban infrastructure and concrete impervious surfaces.
    """
    def __init__(self, in_channels: int = 4):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_channels, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 1, kernel_size=1),
            nn.Sigmoid()
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)

class UrbanExpansionModel(BaseRemoteSensingModel):
    """
    Modular AI Model: Built-Up & Urban Infrastructure Segmenter.
    """
    def __init__(self):
        super().__init__(name="SatQuery Urban Built-Up Segmenter v2.0", task_type="urban_expansion_segmentation")

    def _load_model(self):
        self.model = BuiltUpCNN(in_channels=4).to(self.device)
        self.model.eval()
        self.is_loaded = True

    def infer(self, tensor_inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        bbox = metadata.get("bbox", [0.0, 0.0, 1.0, 1.0])
        ndbi = tensor_inputs.get("ndbi")
        ndvi = tensor_inputs.get("ndvi")
        swir = tensor_inputs.get("swir")
        red = tensor_inputs.get("red")

        h, w = ndbi.shape

        # Physics baseline: High NDBI, low NDVI, elevated SWIR
        builtup_prob = np.clip((ndbi + 0.1) / 0.4, 0.0, 1.0) * (ndvi < 0.28).astype(np.float32)

        x_in = np.stack([ndbi, ndvi, swir, red], axis=0)
        torch_x = torch.from_numpy(x_in).unsqueeze(0).float().to(self.device)

        with torch.no_grad():
            cnn_map = self.model(torch_x).squeeze().cpu().numpy()

        combined = 0.6 * builtup_prob + 0.4 * cnn_map
        binary_mask = (combined > 0.42).astype(np.uint8)

        total_bbox_km2, detected_km2, detected_ha = vectorizer.calculate_geodesic_area_km2(bbox, binary_mask)
        mean_confidence = float(np.mean(combined[binary_mask > 0])) if np.any(binary_mask) else 0.0

        features = vectorizer.mask_to_geojson_features(
            mask=binary_mask,
            bbox=bbox,
            class_name="Built-Up / Urban Surface",
            confidence=mean_confidence,
            properties={"color": "#ef4444"}
        )

        coverage_pct = round((detected_km2 / max(0.0001, total_bbox_km2)) * 100.0, 2)

        return {
            "model_name": self.name,
            "task": self.task_type,
            "device": str(self.device),
            "total_area_km2": round(total_bbox_km2, 4),
            "detected_area_km2": round(detected_km2, 4),
            "detected_area_ha": round(detected_ha, 2),
            "coverage_percentage": coverage_pct,
            "mean_confidence": round(mean_confidence, 3),
            "feature_count": len(features),
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            },
            "summary_metrics": {
                "mean_ndbi_in_builtup": float(np.mean(ndbi[binary_mask > 0])) if np.any(binary_mask) else 0.0,
                "mean_ndvi_in_builtup": float(np.mean(ndvi[binary_mask > 0])) if np.any(binary_mask) else 0.0
            }
        }
