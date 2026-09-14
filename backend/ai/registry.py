from typing import List, Dict, Any, Optional
from backend.db.models import ModelRegistryItem

class ModelRegistry:
    """
    Central Model Registry for SatQuery AI.
    Maintains registered specialist models, operational readiness,
    and handles agentic task-to-model routing.
    """

    MODELS = [
        ModelRegistryItem(
            id="vqa",
            name="Remote-Sensing VQA",
            task="Visual Question Answering",
            status="Ready",
            input_type="Optical / Multispectral + Text",
            version="v2.5-rs",
            description="Geospatial vision-language model trained on overhead perspective VQA datasets.",
            selected=False
        ),
        ModelRegistryItem(
            id="captioning",
            name="Scene Captioning",
            task="Dense Scene Understanding",
            status="Ready",
            input_type="Single / Multi-Band Raster",
            version="v1.9-rs",
            description="Produces structured natural-language descriptions of land-use, morphology, and infrastructure.",
            selected=False
        ),
        ModelRegistryItem(
            id="grounding",
            name="Text-Guided Grounding",
            task="Spatial Object & Region Grounding",
            status="Ready",
            input_type="Overhead Imagery + Text Query",
            version="v3.1-box",
            description="Extracts normalized bounding coordinates and masks for natural-language described entities.",
            selected=False
        ),
        ModelRegistryItem(
            id="change_detection",
            name="Change Detection",
            task="Bi-temporal Differential Analysis",
            status="Ready",
            input_type="Paired Co-registered Rasters (T1, T2)",
            version="v2.8-diff",
            description="Identifies structural expansion, vegetation loss, and infrastructural change between epochs.",
            selected=False
        ),
        ModelRegistryItem(
            id="optical_sar",
            name="Optical-SAR Analysis",
            task="Cross-Sensor Multimodal Fusion",
            status="Ready",
            input_type="Optical RGB/NIR + SAR VV/VH Backscatter",
            version="v2.0-fusion",
            description="Combines spectral reflectance with radar roughness and metallic double-bounce backscatter.",
            selected=False
        )
    ]

    @classmethod
    def get_all_models(cls) -> List[ModelRegistryItem]:
        return [m.model_copy() for m in cls.MODELS]

    @classmethod
    def select_models_for_task(cls, task: str, query: str = "") -> List[str]:
        """
        Dynamically returns the list of model IDs selected for a given task and query.
        """
        q_lower = query.lower()
        selected: List[str] = []

        if task == "change_detection" or any(w in q_lower for w in ["change", "increased", "decreased", "between", "difference", "timeline"]):
            selected = ["change_detection", "captioning", "grounding"]
        elif task == "optical_sar" or any(w in q_lower for w in ["sar", "radar", "multimodal", "complementary", "backscatter"]):
            selected = ["optical_sar", "vqa", "grounding"]
        elif task == "grounding" or any(w in q_lower for w in ["where", "locate", "find", "bounding", "box", "detect"]):
            selected = ["grounding", "vqa"]
        elif task == "captioning" or any(w in q_lower for w in ["describe", "caption", "overview", "what is this"]):
            selected = ["captioning", "vqa"]
        else: # general VQA
            selected = ["vqa", "grounding"]

        return selected

    @classmethod
    def get_annotated_models(cls, selected_ids: List[str]) -> List[ModelRegistryItem]:
        models = cls.get_all_models()
        for m in models:
            m.selected = m.id in selected_ids
            if m.selected:
                m.status = "Active"
        return models
