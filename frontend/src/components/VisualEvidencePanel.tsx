import React from 'react';
import { 
  Crosshair, 
  MapPin, 
  Eye, 
  Layers, 
  Check, 
  Maximize2,
  Filter
} from 'lucide-react';
import { VisualEvidence } from '../types';

interface VisualEvidencePanelProps {
  evidence: VisualEvidence[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (ev: VisualEvidence) => void;
  showEvidenceOverlay: boolean;
  onToggleOverlay: (show: boolean) => void;
  onFocusMap?: (box: any) => void;
}

export const VisualEvidencePanel: React.FC<VisualEvidencePanelProps> = ({
  evidence,
  selectedEvidenceId,
  onSelectEvidence,
  showEvidenceOverlay,
  onToggleOverlay,
  onFocusMap,
}) => {
  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">Visual Evidence</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleOverlay(!showEvidenceOverlay)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors flex items-center space-x-1 ${
              showEvidenceOverlay
                ? 'bg-radar-cyan/15 text-radar-cyan border-radar-cyan/30'
                : 'bg-space-850 text-slate-400 border-space-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{showEvidenceOverlay ? 'Overlay ON' : 'Overlay OFF'}</span>
          </button>
        </div>
      </div>

      {/* Evidence Cards */}
      {evidence && evidence.length > 0 ? (
        <div className="space-y-2">
          {evidence.map((ev) => {
            const isSelected = selectedEvidenceId === ev.id;

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvidence(ev)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-space-800 border-radar-cyan shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                    : 'bg-space-850/60 border-space-700/60 hover:bg-space-850 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        ev.label.includes('BUILT-UP') || ev.label.includes('EXPANSION')
                          ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40'
                          : ev.label.includes('LOSS') || ev.label.includes('VEGETATION')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {ev.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  {ev.metric_value && (
                    <span className="text-[10px] font-mono font-bold text-radar-cyan px-2 py-0.5 rounded bg-space-950 border border-space-750 shrink-0 ml-2">
                      {ev.metric_value}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-space-750 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Coordinate Grounded</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvidence(ev);
                      if (onFocusMap && ev.box) onFocusMap(ev.box);
                    }}
                    className="px-2 py-0.5 rounded bg-space-800 hover:bg-space-750 text-radar-cyan hover:text-white border border-radar-cyan/30 flex items-center space-x-1 transition-colors"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>Show on Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-space-950 border border-dashed border-space-750 text-center text-xs text-slate-400 font-mono">
          Run an analysis query to generate localized visual evidence regions and difference masks.
        </div>
      )}
    </div>
  );
};
