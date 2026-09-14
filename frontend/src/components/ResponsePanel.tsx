import React from 'react';
import { 
  CheckCircle2, Gauge, BarChart2, Layers, Cpu, 
  Download, Printer, FileText, ChevronRight, Activity, Crosshair, Sparkles
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { getExportUrl } from '../services/api';

interface ResponsePanelProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  selectedBoxId: string | null;
  onSelectBox: (label: string | null) => void;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
  result,
  isLoading,
  selectedBoxId,
  onSelectBox,
}) => {
  if (isLoading) {
    return (
      <div className="bg-space-900 border border-space-750 rounded-xl p-6 flex flex-col items-center justify-center min-h-[360px] text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Cpu className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200 font-mono tracking-wider">
            PROCESSING REMOTE SENSING MULTIMODAL QUERY
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Extracting spectral indices (NDVI/VARI), segmenting land-cover classes, and running VLM reasoning...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-space-900 border border-space-750 rounded-xl p-8 flex flex-col items-center justify-center min-h-[360px] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-space-800 border border-space-700 flex items-center justify-center text-slate-400">
          <Activity className="w-6 h-6 text-cyan-400/60" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 font-mono">
          AWAITING REMOTE SENSING QUERY
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Select a suggested prompt chip below or type a query in natural language to extract intelligence from this satellite scene.
        </p>
      </div>
    );
  }

  const land = result.land_cover_stats;
  const spec = result.spectral_metrics;
  const confPercent = Math.round(result.confidence * 100);

  const handleExportHtml = () => {
    const url = getExportUrl(result.id, 'html');
    window.open(url, '_blank');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `satquery_intelligence_${result.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 lg:p-5 shadow-2xl space-y-4">
      {/* Top Banner & Confidence Gauge */}
      <div className="flex items-center justify-between border-b border-space-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
            INTELLIGENCE SYNTHESIS
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 border border-space-700 text-slate-400 font-mono">
            {result.model_used}
          </span>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center space-x-2 bg-space-950 px-2.5 py-1 rounded-lg border border-space-750">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono text-slate-300">CONFIDENCE:</span>
          <span className={`text-xs font-mono font-bold ${
            confPercent > 90 ? 'text-emerald-400' : 'text-cyan-400'
          }`}>
            {confPercent}%
          </span>
        </div>
      </div>

      {/* Main AI Answer Box */}
      <div className="bg-space-950/80 border border-space-750 rounded-xl p-4 shadow-inner">
        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Visual Language Answer
        </div>
        <div className="text-sm text-slate-100 leading-relaxed space-y-2">
          {result.answer.split('\n\n').map((paragraph, i) => (
            <p key={i}>
              {paragraph.split('**').map((chunk, j) => 
                j % 2 === 1 ? <strong key={j} className="text-cyan-300 font-semibold">{chunk}</strong> : chunk
              )}
            </p>
          ))}
        </div>
      </div>

      {/* Land Cover Classification Bar */}
      <div className="bg-space-950/50 border border-space-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" /> Land-Cover Distribution
          </span>
          <span className="text-slate-500 text-[10px]">Pixel Surface Classification</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-space-800 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: `${land.vegetation}%` }} className="bg-emerald-500 h-full transition-all" title={`Vegetation: ${land.vegetation}%`} />
          <div style={{ width: `${land.built_up}%` }} className="bg-purple-500 h-full transition-all" title={`Built-Up: ${land.built_up}%`} />
          <div style={{ width: `${land.water}%` }} className="bg-blue-500 h-full transition-all" title={`Water: ${land.water}%`} />
          <div style={{ width: `${land.barren}%` }} className="bg-amber-600 h-full transition-all" title={`Barren/Soil: ${land.barren}%`} />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
            <span>Vegetation: <b className="text-emerald-400">{land.vegetation}%</b></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
            <span>Built-Up: <b className="text-purple-400">{land.built_up}%</b></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" />
            <span>Water: <b className="text-blue-400">{land.water}%</b></span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded bg-amber-600 inline-block" />
            <span>Barren: <b className="text-amber-400">{land.barren}%</b></span>
          </div>
        </div>
      </div>

      {/* Spectral Metrics Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-space-950/60 border border-space-800 rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Simulated NDVI</div>
          <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">{spec.mean_ndvi}</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{spec.vegetation_health}</div>
        </div>
        <div className="bg-space-950/60 border border-space-800 rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Built-up Density</div>
          <div className="text-base font-bold font-mono text-purple-400 mt-0.5">{spec.built_up_density}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{land.built_up}% surface ratio</div>
        </div>
        <div className="bg-space-950/60 border border-space-800 rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Water Turbidity</div>
          <div className="text-base font-bold font-mono text-blue-400 mt-0.5">{spec.water_turbidity}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{land.water}% coverage</div>
        </div>
        <div className="bg-space-950/60 border border-space-800 rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Atmospheric Obscuration</div>
          <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{spec.cloud_coverage_percent}%</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">Clear visibility</div>
        </div>
      </div>

      {/* Detected Spatial Features Badges */}
      {result.detected_objects && result.detected_objects.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Crosshair className="w-3.5 h-3.5" /> Detected Target Entities ({result.detected_objects.length})
            </span>
            <span className="text-[10px] text-slate-500">Click to highlight on satellite canvas</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {result.detected_objects.map((obj, i) => {
              const active = selectedBoxId === obj.label;
              return (
                <button
                  key={i}
                  onClick={() => onSelectBox(active ? null : obj.label)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 border ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-space-950/80 text-slate-300 border-space-700 hover:border-slate-500'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: obj.color || '#06b6d4' }}
                  />
                  <span>{obj.label}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {Math.round(obj.confidence * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Export Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-space-800">
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Intelligence Actions:</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportHtml}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-200 text-xs font-mono transition-all hover:border-cyan-500/50"
            title="Generate print-ready intelligence report"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-slate-200 text-xs font-mono transition-all hover:border-cyan-500/50"
            title="Download full JSON analysis dataset"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
