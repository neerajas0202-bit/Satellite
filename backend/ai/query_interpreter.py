import re
from typing import Dict, Any, List

class QueryInterpreter:
    """
    Interprets natural language Earth Observation requests to route them to the appropriate
    remote-sensing processing pipeline and PyTorch model.
    """

    WATER_KEYWORDS = ["flood", "water", "lake", "river", "inundat", "reservoir", "wetland", "coastal", "ocean", "sea", "pond"]
    VEGETATION_KEYWORDS = ["vegetation", "forest", "tree", "deforest", "canopy", "crop", "agriculture", "greenery", "biomass", "flora"]
    URBAN_KEYWORDS = ["built-up", "urban", "building", "construction", "concrete", "infrastructure", "city", "expansion", "road", "sprawl"]
    CHANGE_KEYWORDS = ["compare", "difference between", "over time", "timeline", "before and after", "vs", "versus"]

    @classmethod
    def interpret(cls, query: str) -> Dict[str, Any]:
        q = query.lower().strip()
        
        has_dual_dates = bool(re.search(r'\b(20\d\d)\b.*\b(20\d\d)\b', q))
        is_change = any(w in q for w in cls.CHANGE_KEYWORDS) or has_dual_dates
        has_water = any(w in q for w in cls.WATER_KEYWORDS)
        has_veg = any(w in q for w in cls.VEGETATION_KEYWORDS)
        has_urban = any(w in q for w in cls.URBAN_KEYWORDS)

        if is_change:
            task_type = "change_detection"
            intent_label = "Multi-Temporal Bi-Date Change Detection"
            recommended_satellite = "Sentinel-2"
        elif has_water:
            task_type = "water_flood_segmentation"
            intent_label = "Water Body & Flood Inundation Mapping"
            recommended_satellite = "Sentinel-1" if "flood" in q else "Sentinel-2"
        elif has_urban:
            task_type = "urban_expansion_segmentation"
            intent_label = "Built-up & Infrastructure Segmentation"
            recommended_satellite = "Sentinel-2"
        elif has_veg:
            task_type = "vegetation_loss_analysis"
            intent_label = "Vegetation Canopy & Biomass Analysis"
            recommended_satellite = "Sentinel-2"
        else:
            task_type = "land_cover_classification"
            intent_label = "Comprehensive Land Use / Land Cover Classification"
            recommended_satellite = "Sentinel-2"

        return {
            "query": query,
            "task_type": task_type,
            "intent_label": intent_label,
            "is_temporal_change": is_change,
            "recommended_satellite": recommended_satellite
        }

query_interpreter = QueryInterpreter()
