import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileCheck, AlertCircle, Image as ImageIcon, Compass, Calendar, Layers } from 'lucide-react';
import { uploadImagery } from '../services/api';
import { ImageMetadata } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (img: ImageMetadata) => void;
  isPairUpload?: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  isPairUpload = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [gsd, setGsd] = useState<number>(10.0);
  const [sensorType, setSensorType] = useState<string>('Sentinel-2 MSI (10m Multispectral)');
  const [modality, setModality] = useState<'OPTICAL' | 'SAR'>('OPTICAL');
  const [crs, setCrs] = useState<string>('EPSG:4326');
  const [acquisitionDate, setAcquisitionDate] = useState<string>('2025-02-20');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      setError(null);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      setError(null);

      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a satellite image to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const res = await uploadImagery(file, {
        title: title.trim() || file.name,
        description: description.trim(),
        gsd_meters: gsd,
        sensor_type: sensorType,
        modality: modality,
        crs: crs,
        acquisition_date: acquisitionDate,
      });

      onUploadSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload satellite image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-space-900 border border-space-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-radar-cyan mb-4 font-mono">
          <UploadCloud className="w-5 h-5" />
          <h2 className="text-sm font-bold tracking-wider uppercase">
            {isPairUpload ? 'Upload Observation Pair (T2 / SAR)' : 'Upload Satellite Imagery (GeoTIFF / PNG / JPEG)'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-space-700 hover:border-radar-cyan/60 rounded-xl p-5 text-center cursor-pointer bg-space-950/60 hover:bg-space-850/40 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.tif,.tiff,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Upload Preview"
                  className="max-h-36 mx-auto rounded object-contain border border-space-700"
                />
                <div className="text-emerald-400 text-xs font-semibold flex items-center justify-center space-x-1">
                  <FileCheck className="w-4 h-4" />
                  <span>{file?.name} ({(file?.size! / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-8 h-8 text-radar-cyan mx-auto mb-2" />
                <div className="text-slate-200 font-semibold">Drop satellite imagery here</div>
                <div className="text-[11px] text-slate-400">
                  GeoTIFF • TIFF • PNG • JPEG
                </div>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Title / Scene Identifier</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sentinel-2 Urban Sector T1"
                className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-radar-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Modality</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as any)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-radar-cyan"
                >
                  <option value="OPTICAL">OPTICAL (RGB/Multispectral)</option>
                  <option value="SAR">SAR (Radar Microwave)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">CRS Projection</label>
                <input
                  type="text"
                  value={crs}
                  onChange={(e) => setCrs(e.target.value)}
                  placeholder="EPSG:4326"
                  className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-radar-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Resolution (GSD in meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={gsd}
                  onChange={(e) => setGsd(parseFloat(e.target.value))}
                  className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-radar-cyan"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Acquisition Date</label>
                <input
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                  className="w-full bg-space-950 border border-space-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-radar-cyan"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-750 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50"
            >
              <span>{isUploading ? 'Ingesting Raster...' : 'Upload & Validate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
