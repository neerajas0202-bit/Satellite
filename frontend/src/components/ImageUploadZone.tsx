import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle2, AlertCircle, Trash2, Globe, FileCode, Sparkles } from 'lucide-react';
import { uploadSatelliteImage, UploadedImageMeta } from '../services/satelliteApi';

interface ImageUploadZoneProps {
  currentImage: UploadedImageMeta | null;
  onImageUploaded: (meta: UploadedImageMeta) => void;
  onClearImage: () => void;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  currentImage,
  onImageUploaded,
  onClearImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const meta = await uploadSatelliteImage(file);
      onImageUploaded(meta);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process and upload satellite image.');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Satellite / Aerial Image Input</h3>
            <p className="text-[11px] text-slate-400">GeoTIFF, TIFF, PNG, or JPEG satellite capture</p>
          </div>
        </div>

        {currentImage && (
          <button
            onClick={onClearImage}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-950/40 border border-rose-500/30 rounded-lg transition"
          >
            <Trash2 className="w-3 h-3" />
            <span>Replace</span>
          </button>
        )}
      </div>

      {currentImage ? (
        /* Uploaded Image Card */
        <div className="space-y-3">
          <div className="relative group rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950/80 p-2 flex gap-3 items-center">
            <img
              src={currentImage.preview_url}
              alt={currentImage.original_name}
              className="w-20 h-20 object-cover rounded-md border border-slate-800 shrink-0"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 truncate">{currentImage.original_name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {currentImage.width} × {currentImage.height} px
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                  {currentImage.file_size_kb} KB
                </span>
                <span className={`px-1.5 py-0.5 rounded border ${
                  currentImage.is_georeferenced
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                }`}>
                  {currentImage.is_georeferenced ? `Georeferenced (${currentImage.crs})` : 'Image-Space (No GPS)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-slate-700 hover:border-cyan-500/50 hover:bg-slate-850/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          {isUploading ? (
            <div className="py-4 space-y-2">
              <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-cyan-300 font-semibold">Inspecting & Preprocessing Uploaded Image...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Click to upload or drag & drop satellite image
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  GeoTIFF, TIFF, PNG, or JPEG (Up to 50MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="mt-3 p-2.5 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
