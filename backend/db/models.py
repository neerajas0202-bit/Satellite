from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class BoundingBox(BaseModel):
    ymin: float
    xmin: float
    ymax: float
    xmax: float
    label: str
    confidence: float
    color: Optional[str] = "#00f0ff"
    attributes: Optional[Dict[str, Any]] = None

class OverlayItem(BaseModel):
    id: str
    layer: str = "general" # roads, buildings, built_up, vegetation, water, change, general
    geometry_type: str = "box" # box, line, polygon, mask
    coordinates: List[Any] = [] # line: [[x1, y1], [x2, y2]], polygon: [[x, y], ...], box: [ymin, xmin, ymax, xmax]
    label: str
    confidence: float
    color: Optional[str] = "#00f0ff"
    attributes: Optional[Dict[str, Any]] = None

class QueryIntent(BaseModel):
    action: str = "ANALYZE" # LOCATE, IDENTIFY, CLASSIFY, DESCRIBE, COMPARE, COUNT, etc.
    targets: List[str] = [] # "major roads", "built-up areas", "buildings", etc.
    task: str = "VQA"
    visualization: str = "HIGHLIGHT" # HIGHLIGHT, BOUNDING_BOX, OVERLAY, MASK
    location_req: Optional[str] = None
    temporal_req: bool = False
    sensor_req: Optional[str] = None
    comparison_req: bool = False

class LandCoverStats(BaseModel):
    vegetation: float = 0.0
    water: float = 0.0
    built_up: float = 0.0
    barren: float = 0.0
    clouds_shadows: float = 0.0

class SpectralMetrics(BaseModel):
    mean_ndvi: float = 0.0
    vegetation_health: str = "Moderate"
    water_turbidity: Optional[str] = "Normal"
    built_up_density: Optional[str] = "Medium"
    cloud_coverage_percent: float = 0.0

class VisualEvidence(BaseModel):
    id: str
    label: str
    description: str
    box: Optional[BoundingBox] = None
    metric_value: Optional[str] = None
    evidence_type: str = "region" # region, mask, change_diff, backscatter

class ExecutionTraceStep(BaseModel):
    step_num: str # "01", "02", etc.
    name: str
    description: str
    status: str = "pending" # pending, running, completed, warning, error
    latency_ms: Optional[int] = 0
    details: Optional[str] = None

class ConfidenceBreakdown(BaseModel):
    overall: float = 91.0
    query_understanding: float = 97.0
    model_selection: float = 94.0
    spatial_evidence: float = 89.0
    final_answer: float = 91.0
    disclaimer: str = "Confidence is an estimate based on model agreement, geospatial sensor resolution, and spatial evidence consistency."

class KeyFinding(BaseModel):
    category: str # "Built-up Area", "New Construction", "Vegetation", etc.
    value: str # "+18.4%", "Detected", "-6.2%"
    status: str = "info" # positive, warning, neutral, alert
    description: Optional[str] = None

class ValidationCheckItem(BaseModel):
    id: str
    name: str
    passed: bool
    status_text: str # "✓ Valid", "✓ Compatible", "⚠ Mismatch"
    details: str

class ValidationResult(BaseModel):
    is_valid: bool
    status: str # "COMPATIBLE", "WARNING", "INCOMPATIBLE"
    image_count: int
    modality_pair: str # "Single Optical", "Optical + SAR", "Bi-temporal Optical"
    geographic_overlap_pct: float
    temporal_delta_days: Optional[int] = None
    checks: List[ValidationCheckItem] = []
    summary_message: str

class ModelRegistryItem(BaseModel):
    id: str
    name: str
    task: str
    status: str = "Ready" # Ready, Active, Standby
    input_type: str
    version: str = "v2.4-rs"
    description: str
    selected: bool = False

class ImageMetadata(BaseModel):
    id: str
    filename: str
    original_name: str
    width: int
    height: int
    gsd_meters: float = 10.0
    sensor_type: str = "Sentinel-2 MSI"
    modality: str = "OPTICAL" # OPTICAL, SAR, MULTISPECTRAL
    crs: str = "EPSG:4326"
    acquisition_date: str = "2025-02-20"
    source_type: str = "upload" # upload, sample
    title: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    url: Optional[str] = None
    pair_id: Optional[str] = None
    sample_queries: Optional[List[str]] = []

class QueryRequest(BaseModel):
    image_id: Optional[str] = None
    image_ids: Optional[List[str]] = None
    query: str
    pair_image_id: Optional[str] = None
    analysis_mode: Optional[str] = "vqa"
    mode: Optional[str] = "demo"
    model_provider: Optional[str] = "satquery_agent"

class AnalysisResult(BaseModel):
    id: str
    image_id: str
    pair_image_id: Optional[str] = None
    query: str
    task_identified: str = "Remote-Sensing VQA"
    analysis_mode: str = "vqa"
    intent: Optional[QueryIntent] = None
    answer: str
    confidence: float
    confidence_breakdown: ConfidenceBreakdown = Field(default_factory=ConfidenceBreakdown)
    key_findings: List[KeyFinding] = []
    detected_objects: List[BoundingBox] = []
    visual_evidence: List[VisualEvidence] = []
    overlays: List[OverlayItem] = []
    land_cover_stats: LandCoverStats = Field(default_factory=LandCoverStats)
    spectral_metrics: SpectralMetrics = Field(default_factory=SpectralMetrics)
    execution_trace: List[ExecutionTraceStep] = []
    selected_models: List[str] = []
    model_used: str = "SatQuery Agentic Ensemble"
    validation: Optional[ValidationResult] = None
    is_demo: bool = True
    mode: str = "demo"
    created_at: Optional[str] = None
    elapsed_seconds: float = 4.8

class CompareRequest(BaseModel):
    before_image_id: str
    after_image_id: str
    query: Optional[str] = "What changed between these two images?"

class CompareResult(BaseModel):
    before_image_id: str
    after_image_id: str
    before_date: str = "2022-03-15"
    after_date: str = "2025-02-20"
    temporal_delta_years: float = 2.9
    built_up_expansion_pct: float = 18.4
    vegetation_loss_pct: float = -6.2
    new_structures_detected: int = 24
    road_expansion_km: float = 3.8
    water_change_pct: float = 0.5
    overall_confidence: float = 91.0
    summary: str
    change_map_url: Optional[str] = None
    key_findings: List[KeyFinding] = []
    evidence_regions: List[VisualEvidence] = []
    execution_trace: List[ExecutionTraceStep] = []

class MultimodalRequest(BaseModel):
    optical_image_id: str
    sar_image_id: str
    query: Optional[str] = "Use optical and SAR data to identify built-up and water-covered regions."

class MultimodalResult(BaseModel):
    optical_image_id: str
    sar_image_id: str
    optical_sensor: str = "Sentinel-2 MSI (Optical/Multispectral)"
    sar_sensor: str = "Sentinel-1 C-SAR (C-band Radar, VV/VH)"
    optical_findings: str
    sar_findings: str
    fusion_interpretation: str
    complementary_evidence: List[Dict[str, Any]] = []
    confidence: float = 94.0
    built_up_overlap_agreement: float = 93.8
    water_boundary_sharpness: float = 97.2
    execution_trace: List[ExecutionTraceStep] = []

class ReportItem(BaseModel):
    id: str
    title: str
    query: str
    date: str
    dataset: str
    analysis_type: str
    confidence: float
    status: str = "Completed"
    image_names: List[str] = []
    key_finding_summary: str
