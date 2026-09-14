import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List
from backend.ai.models.base import BaseRemoteSensingModel
from backend.ai.models.vectorizer import vectorizer

class LandCoverUNetLite(nn.Module):
    """
    Multispectral Land-Cover Segmentation Network.
    Takes 5-band input (Red, Green, Blue, NIR, SWIR) and outputs 5-class logits.
    """
    def __init__(self, in_channels: int = 5, num_classes: int = 5):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True)
        )
        self.decoder = nn.Sequential(
            nn.Conv2d(64, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, num_classes, kernel_size=1)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.encoder(x)
        out = self.decoder(feat)
        return out

class LandCoverSegmentationModel(BaseRemoteSensingModel):
    """
    Modular AI Model: Multi-class Land Use / Land Cover (LULC) Classification & Segmentation.
    """
    CLASSES = [
        {"id": 0, "name": "Water Body", "color": "#0ea5e9"},
        {"id": 1, "name": "Dense Forest / Canopy", "color": "#16a34a"},
        {"id": 2, "name": "Cropland / Grassland", "color": "#84cc16"},
        {"id": 3, "name": "Urban / Built-up", "color": "#ef4444"},
        {"id": 4, "name": "Barren Land / Soil", "color": "#d97706"}
    ]

    def __init__(self):
        super().__init__(name="SatQuery LULC Multispectral Segmenter v2.0", task_type="land_cover_classification")

    def _load_model(self):
        self.model = LandCoverUNetLite(in_channels=5, num_classes=5).to(self.device)
        self.model.eval()
        self.is_loaded = True

    def infer(self, tensor_inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        bbox = metadata.get("bbox", [0.0, 0.0, 1.0, 1.0])
        red = tensor_inputs.get("red")
        green = tensor_inputs.get("green")
        blue = tensor_inputs.get("blue")
        nir = tensor_inputs.get("nir")
        swir = tensor_inputs.get("swir")
        ndvi = tensor_inputs.get("ndvi")
        ndwi = tensor_inputs.get("ndwi")
        ndbi = tensor_inputs.get("ndbi")

        h, w = red.shape

        # Stack input tensor [5, H, W]
        x_in = np.stack([red, green, blue, nir, swir], axis=0)
        torch_x = torch.from_numpy(x_in).unsqueeze(0).float().to(self.device)

        with torch.no_grad():
            logits = self.model(torch_x).squeeze(0) # [5, H, W]
            probs = torch.softmax(logits, dim=0).cpu().numpy()

        # Remote sensing spectral rules prior:
        spectral_priors = np.zeros((5, h, w), dtype=np.float32)
        # 0: Water -> high NDWI
        spectral_priors[0] = np.clip((ndwi + 0.1) / 0.5, 0.0, 1.0) * (nir < 0.3)
        # 1: Forest -> high NDVI (> 0.45)
        spectral_priors[1] = np.clip((ndvi - 0.35) / 0.45, 0.0, 1.0)
        # 2: Grass/Crop -> moderate NDVI (0.15 to 0.45)
        spectral_priors[2] = np.clip(1.0 - np.abs(ndvi - 0.3) / 0.3, 0.0, 1.0) * (ndwi < 0.0)
        # 3: Built-up -> high NDBI (> 0.0) & low NDVI
        spectral_priors[3] = np.clip((ndbi + 0.1) / 0.4, 0.0, 1.0) * (ndvi < 0.25)
        # 4: Barren / Soil -> low NDVI and moderate SWIR
        spectral_priors[4] = np.clip((swir - 0.2) / 0.5, 0.0, 1.0) * (ndvi < 0.18) * (ndwi < 0.0)

        fused = 0.5 * probs + 0.5 * spectral_priors
        pred_classes = np.argmax(fused, axis=0)

        total_bbox_km2, _, _ = vectorizer.calculate_geodesic_area_km2(bbox, np.ones_like(pred_classes))
        
        all_features = []
        class_stats = []

        for c_info in self.CLASSES:
            c_id = c_info["id"]
            c_mask = (pred_classes == c_id).astype(np.uint8)
            pix_count = int(np.count_nonzero(c_mask))
            ratio = pix_count / float(h * w)
            class_area_km2 = total_bbox_km2 * ratio
            class_area_ha = class_area_km2 * 100.0

            feats = vectorizer.mask_to_geojson_features(
                mask=c_mask,
                bbox=bbox,
                class_name=c_info["name"],
                confidence=float(np.mean(fused[c_id][c_mask > 0])) if pix_count > 0 else 0.0,
                properties={"color": c_info["color"], "class_id": c_id},
                max_polygons=8
            )
            all_features.extend(feats)

            class_stats.append({
                "class_id": c_id,
                "name": c_info["name"],
                "color": c_info["color"],
                "area_km2": round(class_area_km2, 4),
                "area_ha": round(class_area_ha, 2),
                "percentage": round(ratio * 100.0, 2),
                "pixel_count": pix_count
            })

        dominant_class = max(class_stats, key=lambda x: x["percentage"])

        return {
            "model_name": self.name,
            "task": self.task_type,
            "device": str(self.device),
            "total_area_km2": round(total_bbox_km2, 4),
            "dominant_class": dominant_class["name"],
            "class_distribution": class_stats,
            "geojson": {
                "type": "FeatureCollection",
                "features": all_features
            }
        }
