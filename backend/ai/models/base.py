import torch
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseRemoteSensingModel(ABC):
    """
    Abstract base class for all SatQuery modular remote sensing AI models.
    Supports dynamic hardware acceleration (CUDA, Apple MPS, or CPU).
    """

    def __init__(self, name: str, task_type: str):
        self.name = name
        self.task_type = task_type
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.is_loaded = False
        self._load_model()

    @abstractmethod
    def _load_model(self):
        """Initialize and load model architecture / weights onto compute device."""
        pass

    @abstractmethod
    def infer(self, tensor_inputs: Dict[str, Any], metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute actual tensor forward pass and post-processing.
        Must return genuine predictions, probabilities, and spatial mask tensors.
        """
        pass

    def get_info(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "task_type": self.task_type,
            "device": str(self.device),
            "is_loaded": self.is_loaded,
            "is_cuda": self.device.type == "cuda"
        }
