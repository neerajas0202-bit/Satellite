import {
  ImageMetadata,
  AnalysisResult,
  ValidationResult,
  ModelRegistryItem,
  CompareResult,
  MultimodalResult,
  ReportItem,
  EvaluationResponse
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchModels(): Promise<ModelRegistryItem[]> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch model registry');
  return res.json();
}

export async function fetchSampleScenes(): Promise<ImageMetadata[]> {
  const res = await fetch(`${API_BASE}/samples`);
  if (!res.ok) throw new Error('Failed to load sample scenes');
  return res.json();
}

export async function validateInputs(
  imageId: string,
  pairImageId?: string,
  taskHint?: string
): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append('image_id', imageId);
  if (pairImageId) formData.append('pair_image_id', pairImageId);
  if (taskHint) formData.append('task_hint', taskHint);

  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to validate imagery');
  return res.json();
}

export async function submitAnalyzeQuery(
  imageId: string,
  query: string,
  pairImageId?: string,
  analysisMode: string = 'vqa'
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_id: imageId,
      pair_image_id: pairImageId,
      query: query,
      analysis_mode: analysisMode,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze query');
  }
  return res.json();
}

export async function compareTemporalScenes(
  beforeImageId: string,
  afterImageId: string,
  query?: string
): Promise<CompareResult> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      before_image_id: beforeImageId,
      after_image_id: afterImageId,
      query: query,
    }),
  });
  if (!res.ok) throw new Error('Failed to compare temporal scenes');
  return res.json();
}

export async function analyzeMultimodalOpticalSAR(
  opticalImageId: string,
  sarImageId: string,
  query?: string
): Promise<MultimodalResult> {
  const res = await fetch(`${API_BASE}/multimodal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      optical_image_id: opticalImageId,
      sar_image_id: sarImageId,
      query: query,
    }),
  });
  if (!res.ok) throw new Error('Failed to run optical+SAR analysis');
  return res.json();
}

export async function uploadImagery(
  file: File,
  options?: {
    title?: string;
    description?: string;
    gsd_meters?: number;
    sensor_type?: string;
    modality?: string;
    crs?: string;
    acquisition_date?: string;
    pair_id?: string;
  }
): Promise<ImageMetadata> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.title) formData.append('title', options.title);
  if (options?.description) formData.append('description', options.description);
  if (options?.gsd_meters) formData.append('gsd_meters', options.gsd_meters.toString());
  if (options?.sensor_type) formData.append('sensor_type', options.sensor_type);
  if (options?.modality) formData.append('modality', options.modality);
  if (options?.crs) formData.append('crs', options.crs);
  if (options?.acquisition_date) formData.append('acquisition_date', options.acquisition_date);
  if (options?.pair_id) formData.append('pair_id', options.pair_id);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function fetchReports(): Promise<ReportItem[]> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to load reports');
  return res.json();
}

export async function fetchReportDetail(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/reports/${id}`);
  if (!res.ok) throw new Error('Failed to load report detail');
  return res.json();
}

export async function deleteReport(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete report');
}

export async function fetchEvaluation(): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/evaluation`);
  if (!res.ok) throw new Error('Failed to load evaluation benchmarks');
  return res.json();
}

export const getExportUrl = (id: string, format: string = 'html') => `${API_BASE}/export/${id}?format=${format}`;
export const submitQuery = submitAnalyzeQuery;
export const fetchHistory = fetchReports;
export const deleteHistoryItem = deleteReport;
export const uploadImage = uploadImagery;
