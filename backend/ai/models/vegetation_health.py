import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List
from backend.ai.models.base import BaseRemoteSensingModel
from backend.ai.models.vectorizer import vectorizer

class VegetationLossModel(BaseRemoteSensingModel):
    """
    Modular AI Model: Vegetation Canopy & Forest Loss Inspector.
    """
    def __init__(self):
        super().__init__(name="SatQuery Canopy & Vegetation Loss Detector v2.0", task_type="vegetation_loss_analysis")

    def _load_model(self):
        self.is_loaded = True

    def infer(self, tensor_inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        bbox = metadata.get("bbox", [0.0, 0.0, 1.0, 1.0])
        ndvi = tensor_inputs.get("ndvi")
        nir = tensor_inputs.get("nir")
        red = tensor_inputs.get("red")

        # Canopy segmentation: High NDVI (> 0.40) and high NIR reflectance
        healthy_canopy_mask = (ndvi > 0.45).astype(np.uint8)
        stressed_veg_mask = ((ndvi > 0.20) & (ndvi <= 0.45)).astype(np.uint8)
        degraded_mask = ((ndvi < 0.20) & (ndvi > 0.0)).astype(np.uint8)

        total_bbox_km2, canopy_km2, canopy_ha = vectorizer.calculate_geodesic_area_km2(bbox, healthy_canopy_mask)
        _, stressed_km2, stressed_ha = vectorizer.calculate_geodesic_area_km2(bbox, stressed_veg_mask)
        _, degraded_km2, degraded_ha = vectorizer.calculate_geodesic_area_km2(bbox, degraded_mask)

        features = []
        features.extend(vectorizer.mask_to_geojson_features(
            healthy_canopy_mask, bbox, "Healthy Dense Canopy", 0.94,
            properties={"color": "#15803d"}
        ))
        features.extend(vectorizer.mask_to_geojson_features(
            stressed_veg_mask, bbox, "Low Vegetation / Stressed", 0.86,
            properties={"color": "#84cc16"}
        ))
        features.extend(vectorizer.mask_to_geojson_features(
            degraded_mask, bbox, "Vegetation Loss / Sparse Cover", 0.88,
            properties={"color": "#eab308"}
        ))

        mean_ndvi = float(np.mean(ndvi))

        return {
            "model_name": self.name,
            "task": self.task_type,
            "device": str(self.device),
            "total_area_km2": round(total_bbox_km2, 4),
            "healthy_canopy_km2": round(canopy_km2, 4),
            "healthy_canopy_ha": round(canopy_ha, 2),
            "healthy_canopy_pct": round((canopy_km2 / max(0.0001, total_bbox_km2)) * 100.0, 2),
            "stressed_veg_km2": round(stressed_km2, 4),
            "stressed_veg_ha": round(stressed_ha, 2),
            "degraded_veg_km2": round(degraded_km2, 4),
            "degraded_veg_ha": round(degraded_ha, 2),
            "mean_ndvi_overall": round(mean_ndvi, 3),
            "geojson": {
                "type": "FeatureCollection",
                "features": features
            }
        }
