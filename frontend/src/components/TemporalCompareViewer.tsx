import React, { useState } from 'react';
import { Play, ArrowRight, TrendingDown, Building, RefreshCw, Calendar, Sparkles, AlertTriangle } from 'lucide-react';
import { compareRegions } from '../services/satelliteApi';

interface TemporalCompareViewerProps {
  bbox: number[];
}

export const TemporalCompareViewer: React.FC<TemporalCompareViewerProps> = ({ bbox }) => {
  const [t1Start, setT1Start] = useState('2023-01-01');
  const [t1End, setT1End] = useState('2023-12-31');
  const [t2Start, setT2Start] = useState('2025-01-01');
  const [t2End, setT2End] = useState('2025-12-31');
  const [query, setQuery] = useState('Show built-up expansion and vegetation loss between 2023 and 2025');
  const [satellite, setSatellite] = useState('Sentinel-2');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<any>(null);

  const handleRunComparison = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await compareRegions({
        query,
        bbox,
        t1_date_range: [t1Start, t1End],
        t2_date_range: [t2Start, t2End],
        satellite
      });
      if (res.status === 'unavailable') {
        setError(res.message);
      } else {
        setCompareResult(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete temporal comparison.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 max-w-6xl mx-auto">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Multi-Temporal Change Detection</h2>
            <p className="text-xs text-slate-400">Compare dual-date real satellite observations to measure surface transformation.</p>
          </div>
        </div>

        {/* Temporal Range Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3">
          {/* Baseline Date 1 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date 1 (Baseline Range)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={t1Start}
                onChange={(e) => setT1Start(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
              <input
                type="date"
                value={t1End}
                onChange={(e) => setT1End(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Comparison Date 2 */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date 2 (Comparison Range)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={t2Start}
                onChange={(e) => setT2Start(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
              <input
                type="date"
                value={t2End}
                onChange={(e) => setT2End(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleRunComparison}
          disabled={isLoading}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
        >
          {isLoading ? 'Retrieving Dual Satellite Scenes & Calculating Change...' : 'Execute Multi-Temporal Analysis'}
        </button>
      </div>

      {/* Results View */}
      {compareResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Multi-Temporal Change Summary</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 border border-red-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Vegetation Loss</span>
              <span className="text-base font-bold text-red-400">
                {compareResult.metrics.vegetation_loss?.area_ha} ha
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics.vegetation_loss?.percentage}% of analyzed region
              </span>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Urban / Built-Up Expansion</span>
              <span className="text-base font-bold text-amber-400">
                {compareResult.metrics.urban_expansion?.area_ha} ha
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics.urban_expansion?.percentage}% of analyzed region
              </span>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Vegetation Regrowth</span>
              <span className="text-base font-bold text-emerald-400">
                {compareResult.metrics.vegetation_gain?.area_ha} ha
              </span>
              <span className="text-[11px] text-slate-400 block">
                {compareResult.metrics.vegetation_gain?.percentage}% of analyzed region
              </span>
            </div>
          </div>

          <div className="bg-slate-950/90 border-l-4 border-cyan-500 p-3 rounded-r-lg">
            <p className="text-xs text-slate-200 leading-relaxed">
              {compareResult.natural_language_summary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
