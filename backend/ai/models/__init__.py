from backend.ai.models.base import BaseRemoteSensingModel
from backend.ai.models.water_flood import WaterFloodSegmentationModel
from backend.ai.models.landcover import LandCoverSegmentationModel
from backend.ai.models.change_detection import ChangeDetectionModel
from backend.ai.models.urban_expansion import UrbanExpansionModel
from backend.ai.models.vegetation_health import VegetationLossModel

class ModelRegistry:
    def __init__(self):
        self.models = {
            "water_flood_segmentation": WaterFloodSegmentationModel(),
            "land_cover_classification": LandCoverSegmentationModel(),
            "change_detection": ChangeDetectionModel(),
            "urban_expansion_segmentation": UrbanExpansionModel(),
            "vegetation_loss_analysis": VegetationLossModel()
        }

    def get_model_for_task(self, task: str) -> BaseRemoteSensingModel:
        if task in self.models:
            return self.models[task]
        return self.models["land_cover_classification"]

    def list_all_models(self):
        return [m.get_info() for m in self.models.values()]

model_registry = ModelRegistry()
