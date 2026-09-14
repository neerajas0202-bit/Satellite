export type PageView = 'landing' | 'analyze' | 'compare' | 'optical_sar' | 'reports' | 'evaluation';

export type SpectralLayer = 'natural' | 'ndvi' | 'cir' | 'sar';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
  confidence: number;
  color?: string;
  attributes?: Record<string, any>;
}

export interface LandCoverStats {
  vegetation: number;
  water: number;
  built_up: number;
  barren: number;
  clouds_shadows: number;
}

export interface SpectralMetrics {
  mean_ndvi: number;
  vegetation_health: string;
  water_turbidity?: string;
  built_up_density?: string;
  cloud_coverage_percent: number;
}

export interface VisualEvidence {
  id: string;
  label: string;
  description: string;
  box?: BoundingBox;
  metric_value?: string;
  evidence_type?: string;
}

export interface ExecutionTraceStep {
  step_num: string; // "01", "02", etc.
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'warning' | 'error';
  latency_ms?: number;
  details?: string;
}

export interface ConfidenceBreakdown {
  overall: number;
  query_understanding: number;
  model_selection: number;
  spatial_evidence: number;
  final_answer: number;
  disclaimer: string;
}

export interface KeyFinding {
  category: string;
  value: string;
  status: 'positive' | 'warning' | 'neutral' | 'alert' | 'info';
  description?: string;
}

export interface ValidationCheckItem {
  id: string;
  name: string;
  passed: boolean;
  status_text: string;
  details: string;
}

export interface ValidationResult {
  is_valid: boolean;
  status: 'COMPATIBLE' | 'WARNING' | 'INCOMPATIBLE';
  image_count: number;
  modality_pair: string;
  geographic_overlap_pct: number;
  temporal_delta_days?: number;
  checks: ValidationCheckItem[];
  summary_message: string;
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  task: string;
  status: string;
  input_type: string;
  version: string;
  description: string;
  selected?: boolean;
}

export interface ImageMetadata {
  id: string;
  filename: string;
  original_name: string;
  width: number;
  height: number;
  gsd_meters: number;
  sensor_type: string;
  modality: 'OPTICAL' | 'SAR' | 'MULTISPECTRAL';
  crs: string;
  acquisition_date: string;
  source_type: string;
  title?: string;
  description?: string;
  created_at?: string;
  url?: string;
  pair_id?: string;
  sample_queries?: string[];
}

export interface AnalysisResult {
  id: string;
  image_id: string;
  pair_image_id?: string;
  query: string;
  task_identified: string;
  analysis_mode: string;
  answer: string;
  confidence: number;
  confidence_breakdown: ConfidenceBreakdown;
  key_findings: KeyFinding[];
  detected_objects: BoundingBox[];
  land_cover_stats: LandCoverStats;
  visual_evidence: VisualEvidence[];
  spectral_metrics: SpectralMetrics;
  execution_trace: ExecutionTraceStep[];
  selected_models: string[];
  model_used: string;
  validation?: ValidationResult;
  is_demo: boolean;
  created_at?: string;
  elapsed_seconds: number;
}

export interface CompareResult {
  before_image_id: string;
  after_image_id: string;
  before_date: string;
  after_date: string;
  temporal_delta_years: number;
  built_up_expansion_pct: number;
  vegetation_loss_pct: number;
  new_structures_detected: number;
  road_expansion_km: number;
  water_change_pct: number;
  overall_confidence: number;
  summary: string;
  change_map_url?: string;
  key_findings: KeyFinding[];
  evidence_regions: VisualEvidence[];
  execution_trace: ExecutionTraceStep[];
}

export interface MultimodalResult {
  optical_image_id: string;
  sar_image_id: string;
  optical_sensor: string;
  sar_sensor: string;
  optical_findings: string;
  sar_findings: string;
  fusion_interpretation: string;
  complementary_evidence: Array<{
    feature: string;
    optical_cue: string;
    sar_cue: string;
    synergy: string;
    confidence: number;
  }>;
  confidence: number;
  built_up_overlap_agreement: number;
  water_boundary_sharpness: number;
  execution_trace: ExecutionTraceStep[];
}

export interface ReportItem {
  id: string;
  title: string;
  query: string;
  date: string;
  dataset: string;
  analysis_type: string;
  confidence: number;
  status: string;
  image_names: string[];
  key_finding_summary: string;
}

export interface EvaluationMetric {
  task: string;
  dataset: string;
  score_label: string;
  score: string;
  baseline: string;
  status: string;
}

export interface EvaluationDataset {
  name: string;
  sensors: string;
  description: string;
  patches: string;
  resolution: string;
}

export interface EvaluationResponse {
  title: string;
  disclaimer: string;
  metrics: EvaluationMetric[];
  datasets: EvaluationDataset[];
}

export interface AnalysisHistoryItem {
  id: string;
  image_id?: string;
  query: string;
  analysis_mode?: string;
  answer?: string;
  confidence: number;
  detected_objects?: BoundingBox[];
  land_cover_stats?: LandCoverStats;
  visual_evidence?: VisualEvidence[];
  spectral_metrics?: SpectralMetrics;
  model_used?: string;
  created_at?: string;
  filename?: string;
  original_name?: string;
  image_title?: string;
}

export interface STACScene {
  id: string;
  collection: string;
  datetime: string;
  cloud_cover: number;
  platform: string;
  bbox: number[];
  geometry?: any;
  assets?: Record<string, any>;
}

export interface SatelliteAnalysisResult {
  status: 'completed' | 'unavailable' | 'error';
  id?: string;
  message?: string;
  query: string;
  task_type?: string;
  intent?: string;
  bbox: number[];
  satellite: string;
  scene_metadata?: {
    id: string;
    datetime: string;
    cloud_cover: number;
    platform: string;
    preview_url?: string;
  };
  overlays?: {
    ndvi?: string;
    ndwi?: string;
    false_color?: string;
  };
  model_info?: {
    name: string;
    task_type: string;
    device: string;
    is_cuda: boolean;
  };
  metrics?: Record<string, any>;
  geojson?: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'Polygon';
        coordinates: number[][][];
      };
      properties: Record<string, any>;
    }>;
  };
  natural_language_summary?: string;
}

export interface SystemStatusData {
  status: string;
  timestamp: number;
  compute: {
    torch_version: string;
    device: string;
    device_name: string;
    cuda_available: boolean;
  };
  data_sources: {
    microsoft_planetary_computer: string;
    aws_earth_search: string;
    copernicus_cdse: string;
    satellites_supported: string[];
  };
  loaded_models: Array<{
    name: string;
    task_type: string;
    device: string;
    is_loaded: boolean;
    is_cuda: boolean;
  }>;
}

