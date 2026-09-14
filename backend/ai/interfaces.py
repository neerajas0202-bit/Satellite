from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from backend.db.models import AnalysisResult, QueryRequest

class BaseVisionLanguageModel(ABC):
    """Abstract interface for Remote Sensing Vision-Language Models."""
    
    @abstractmethod
    async def analyze(
        self,
        image_path: str,
        image_metadata: Dict[str, Any],
        request: QueryRequest
    ) -> AnalysisResult:
        """Process image with natural language query and return structured analysis result."""
        pass
