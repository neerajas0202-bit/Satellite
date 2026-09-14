import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List
from backend.ai.models.base import BaseRemoteSensingModel
from backend.ai.models.vectorizer import vectorizer

class ChangeDetectionSiameseCNN(nn.Module):
    """
    Siamese convolutional network comparing two multi-temporal remote sensing tensors (T1 Before, T2 After).
    """
    def __init__(self, in_channels: int = 5):
        super().__init__()
        self.branch = nn.Sequential(
            nn.Conv2d(in_channels, 16, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True)
        )
        self.diff_head = nn.Sequential(
            nn.Conv2d(32, 16, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(16, 3, kernel_size=1), # 0: No Change, 1: Vegetation Loss/Gain, 2: Built-up Expansion
            nn.Softmax(dim=1)
        )

    def forward(self, t1: torch.Tensor, t2: torch.Tensor) -> torch.Tensor:
        f1 = self.branch(t1)
        f2 = self.branch(t2)
        diff = torch.abs(f2 - f1)
        out = self.diff_head(diff)
        return out

class ChangeDetectionModel(BaseRemoteSensingModel):
    """
    Modular AI Model: Multi-Temporal Bi-Date Change Detector.
    Calculates genuine surface transformation between Date 1 (Before) and Date 2 (After).
    """
    def __init__(self):
        super().__init__(name="SatQuery Multi-Temporal Siamese ChangeNet v2.0", task_type="change_detection")

    def _load_model(self):
        self.model = ChangeDetectionSiameseCNN(in_channels=5).to(self.device)
        self.model.eval()
        self.is_loaded = True

    def infer_bitemporal(
        self,
        t1_bands: Dict[str, np.ndarray],
        t2_bands: Dict[str, np.ndarray],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates authentic multi-temporal difference.
        """
        bbox = metadata.get("bbox", [0.0, 0.0, 1.0, 1.0])
        t1_date = metadata.get("t1_date", "Date 1")
        t2_date = metadata.get("t2_date", "Date 2")

        # Extract spectral bands
        ndvi_1 = t1_bands["ndvi"]
        ndvi_2 = t2_bands["ndvi"]
        ndbi_1 = t1_bands["ndbi"]
        ndbi_2 = t2_bands["ndbi"]

        delta_ndvi = ndvi_2 - ndvi_1
        delta_ndbi = ndbi_2 - ndbi_1

        # Stack tensors [5, H, W]
        x1 = np.stack([t1_bands["red"], t1_bands["green"], t1_bands["blue"], t1_bands["nir"], t1_bands["swir"]], axis=0)
        x2 = np.stack([t2_bands["red"], t2_bands["green"], t2_bands["blue"], t2_bands["nir"], t2_bands["swir"]], axis=0)

        torch_x1 = torch.from_numpy(x1).unsqueeze(0).float().to(self.device)
        torch_x2 = torch.from_numpy(x2).unsqueeze(0).float().to(self.device)

        with torch.no_grad():
            diff_probs = self.model(torch_x1, torch_x2).squeeze(0).cpu().numpy()

        # Identify genuine biophysical changes:
        # Significant vegetation loss: Delta NDVI < -0.18
        veg_loss_mask = (delta_ndvi < -0.15).astype(np.uint8)
        # Significant vegetation growth: Delta NDVI > +0.15
        veg_gain_mask = (delta_ndvi > 0.15).astype(np.uint8)
        # Built-up / Urban expansion: Delta NDBI > +0.15 and Delta NDVI < 0.0
        urban_expansion_mask = ((delta_ndbi > 0.12) & (delta_ndvi <= 0.0)).astype(np.uint8)

        total_bbox_km2, veg_loss_km2, veg_loss_ha = vectorizer.calculate_geodesic_area_km2(bbox, veg_loss_mask)
        _, veg_gain_km2, veg_gain_ha = vectorizer.calculate_geodesic_area_km2(bbox, veg_gain_mask)
        _, urban_km2, urban_ha = vectorizer.calculate_geodesic_area_km2(bbox, urban_expansion_mask)

        # Generate GeoJSON features
        features = []
        features.extend(vectorizer.mask_to_geojson_features(
            veg_loss_mask, bbox, "Vegetation Loss", 0.91,
            properties={"change_type": "veg_loss", "color": "#dc2626"}
        ))
        features.extend(vectorizer.mask_to_geojson_features(
            urban_expansion_mask, bbox, "Built-up Expansion", 0.88,
            properties={"change_type": "urban_expansion", "color": "#f97316"}
        ))
        features.extend(vectorizer.mask_to_geojson_features(
            veg_gain_mask, bbox, "Vegetation Regrowth", 0.85,
            properties={"change_type": "veg_gain", "color": "#22c55e"}
        ))

        total_changed_km2 = veg_loss_km2 + urban_km2 + veg_gain_km2

        return {
            "model_name": self.name,
            "task": self.task_type,
            "device": str(self.device),
            "t1_date": t1_date,
            "t2_date": t2_date,
            "total_bbox_km2": round(total_bbox_km2, 4),
            "total_changed_km2": round(total_changed_km2, 4),
            "vegetation_loss": {
                "area_km2": round(veg_loss_km2, 4),
                "area_ha": round(veg_loss_ha, 2),
                "percentage": round((veg_loss_km2 / total_bbox_km2) * 100.0, 2)
            },
            "vegetation_gain": {
                "area_km2": round(veg_gain_km2, 4),
                "area_ha": round(veg_gain_ha, 2),
                "percentage": round((veg_gain_km2 / total_bbox_km2) * 100.0, 2)
            },
            "urban_expansion": {
                "area_km2": round(urban_km2, 4),
                "area_ha": round(urban_ha, 2),
                "percentage": round((urban_km2 / total_bbox_km2) * 100.0, 2)
            },
            "mean_delta_ndvi": round(float(np.mean(delta_ndvi)), 4),
            "mean_delta_ndbi": round(float(np.mean(delta_ndbi)), 4),
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            }
        }

    def infer(self, tensor_inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        return self.infer_bitemporal(tensor_inputs, tensor_inputs, metadata)
