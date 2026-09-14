import { SatelliteAnalysisResult, SystemStatusData, STACScene } from '../types';

const API_BASE = '/api';

export interface UploadedImageMeta {
  id: string;
  filename: string;
  original_name: string;
  preview_url: string;
  width: number;
  height: number;
  channels: number;
  is_georeferenced: boolean;
  crs: string;
  bbox?: number[];
  gsd_meters?: number;
  file_size_kb: number;
}

export async function uploadSatelliteImage(file: File): Promise<UploadedImageMeta> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload-satellite-image`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed with status ${res.status}`);
  }

  return res.json();
}

export async function analyzeUploadedImage(payload: {
  image_id: string;
  query: string;
  satellite_type?: string;
  acquisition_date?: string;
  custom_bbox?: number[];
}): Promise<SatelliteAnalysisResult> {
  const res = await fetch(`${API_BASE}/analyze-uploaded-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Analysis request failed with status ${res.status}`);
  }

  return res.json();
}

export async function compareUploadedImages(payload: {
  before_image_id: string;
  after_image_id: string;
  query: string;
  before_date?: string;
  after_date?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/compare-uploaded-images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Comparison failed with status ${res.status}`);
  }

  return res.json();
}

export async function compareRegions(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/compare-regions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Comparison failed`);
  }
  return res.json();
}

export async function fetchSystemStatus(): Promise<SystemStatusData> {
  const res = await fetch(`${API_BASE}/system/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch system telemetry`);
  }
  return res.json();
}

export async function fetchSatelliteHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/satellite-history`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
