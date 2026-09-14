import React, { useState } from 'react';
import { RefreshCw, UploadCloud, CheckCircle2, ArrowRight, AlertTriangle, Calendar } from 'lucide-react';
import { uploadSatelliteImage, compareUploadedImages, UploadedImageMeta } from '../services/satelliteApi';

export const TemporalUploadCompare: React.FC = () => {
  const [imageA, setImageA] = useState<UploadedImageMeta | null>(null);
  const [imageB, setImageB] = useState<UploadedImageMeta | null>(null);
  const [isUploadingA, setIsUploadingA] = useState(false);
  const [isUploadingB, setIsUploadingB] = useState(false);

  const [dateA, setDateA] = useState('2023-05-15');
  const [dateB, setDateB] = useState('2025-05-20');
  const [query, setQuery] = useState('Show built-up expansion and vegetation loss between both images');

  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<any>(null);

  const handleUpload = async (file: File, target: 'A' | 'B') => {
    setCompareError(null);
    if (target === 'A') setIsUploadingA(true);
    else setIsUploadingB(true);

    try {
      const meta = await uploadSatelliteImage(file);
      if (target === 'A') setImageA(meta);
      else setImageB(meta);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to upload image.');
    } finally {
      if (target === 'A') setIsUploadingA(false);
      else setIsUploadingB(false);
    }
  };

  const handleRunComparison = async () => {
    if (!imageA || !imageB) {
      setCompareError('Both Baseline (Image A) and Comparison (Image B) images are required.');
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    try {
      const res = await compareUploadedImages({
        before_image_id: imageA.id,
        after_image_id: imageB.id,
        query,
        before_date: dateA,
        after_date: dateB
      });
      setCompareResult(res);
    } catch (err: any) {
      setCompareError(err.message || 'Failed to execute temporal comparison.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Dual-Image Multi-Temporal Change Detection</h2>
            <p className="text-xs text-slate-400">Upload two satellite images (Before & After) to measure surface transformation.</p>
          </div>
        </div>

        {/* Dual Upload Zone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Image A */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Image A (Baseline / Before)</span>
              {imageA && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>

            {imageA ? (
              <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <img src={imageA.preview_url} alt="Image A" className="w-16 h-16 object-cover rounded" />
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <span className="font-semibold block truncate">{imageA.original_name}</span>
                  <span className="text-slate-500 font-mono block">{imageA.width}x{imageA.height} px</span>
                  <button onClick={() => setImageA(null)} className="text-rose-400 hover:text-rose-300 text-[10px]">Change</button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition">
                <UploadCloud className="w-5 h-5 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300 font-medium">{isUploadingA ? 'Uploading...' : 'Upload Image A'}</span>
                <input type="file" accept=".tif,.tiff,.png,.jpg,.jpeg" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'A')} />
              </label>
            )}

            <div className="flex items-center gap-2 pt-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs w-full" />
            </div>
          </div>

          {/* Image B */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Image B (Comparison / After)</span>
              {imageB && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>

            {imageB ? (
              <div className="flex items-center gap-3 bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                <img src={imageB.preview_url} alt="Image B" className="w-16 h-16 object-cover rounded" />
                <div className="text-[11px] text-slate-300 space-y-0.5">
                  <span className="font-semibold block truncate">{imageB.original_name}</span>
                  <span className="text-slate-500 font-mono block">{imageB.width}x{imageB.height} px</span>
                  <button onClick={() => setImageB(null)} className="text-rose-400 hover:text-rose-300 text-[10px]">Change</button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition">
                <UploadCloud className="w-5 h-5 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300 font-medium">{isUploadingB ? 'Uploading...' : 'Upload Image B'}</span>
                <input type="file" accept=".tif,.tiff,.png,.jpg,.jpeg" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'B')} />
              </label>
            )}

            <div className="flex items-center gap-2 pt-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs w-full" />
            </div>
          </div>
        </div>

        {compareError && (
          <div className="mb-3 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{compareError}</span>
          </div>
        )}

        <button
          onClick={handleRunComparison}
          disabled={isComparing || !imageA || !imageB}
          className={`w-full py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition shadow-lg ${
            isComparing || !imageA || !imageB
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {isComparing ? 'Aligning Uploaded Tensors & Computing Difference...' : 'Run Multi-Temporal Comparison'}
        </button>
      </div>

      {/* Comparison Results */}
      {compareResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Comparison Results & Change Quantification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-red-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Vegetation Loss</span>
              <span className="text-base font-bold text-red-400">
                {compareResult.metrics?.vegetation_loss?.percentage}%
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics?.vegetation_loss?.area_ha || 0} ha detected
              </span>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Built-Up Expansion</span>
              <span className="text-base font-bold text-amber-400">
                {compareResult.metrics?.urban_expansion?.percentage}%
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics?.urban_expansion?.area_ha || 0} ha detected
              </span>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Vegetation Regrowth</span>
              <span className="text-base font-bold text-emerald-400">
                {compareResult.metrics?.vegetation_gain?.percentage}%
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics?.vegetation_gain?.area_ha || 0} ha detected
              </span>
            </div>
          </div>

          <div className="bg-slate-950/90 border-l-4 border-cyan-500 p-3 rounded-r-lg">
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {compareResult.natural_language_summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
