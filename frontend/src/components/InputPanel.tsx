import React, { useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Maximize2, 
  Calendar,
  Sparkles,
  Split,
  Plus
} from 'lucide-react';
import { ImageMetadata } from '../types';

interface InputPanelProps {
  primaryImage: ImageMetadata | null;
  pairImage: ImageMetadata | null;
  samples: ImageMetadata[];
  isDualMode: boolean;
  onToggleDualMode: (dual: boolean) => void;
  onSelectPrimary: (img: ImageMetadata) => void;
  onSelectPair: (img: ImageMetadata | null) => void;
  onUploadClick: (isPair: boolean) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  primaryImage,
  pairImage,
  samples,
  isDualMode,
  onToggleDualMode,
  onSelectPrimary,
  onSelectPair,
  onUploadClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset scenarios
  const handleLoadScenario = (type: 'temporal' | 'multimodal' | 'airport' | 'harbor') => {
    if (type === 'temporal') {
      const before = samples.find(s => s.id.includes('2022')) || samples[0];
      const after = samples.find(s => s.id.includes('2025')) || samples[1];
      onToggleDualMode(true);
      onSelectPrimary(before);
      onSelectPair(after);
    } else if (type === 'multimodal') {
      const opt = samples.find(s => s.id.includes('optical')) || samples[0];
      const sar = samples.find(s => s.id.includes('sar')) || samples[1];
      onToggleDualMode(true);
      onSelectPrimary(opt);
      onSelectPair(sar);
    } else if (type === 'airport') {
      const air = samples.find(s => s.id.includes('airport')) || samples[0];
      onToggleDualMode(false);
      onSelectPrimary(air);
      onSelectPair(null);
    } else if (type === 'harbor') {
      const harbor = samples.find(s => s.id.includes('harbor')) || samples[0];
      onToggleDualMode(false);
      onSelectPrimary(harbor);
      onSelectPair(null);
    }
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-4">
      {/* Title & Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-space-750">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-radar-cyan" />
            <span>Input Imagery</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {isDualMode ? 'Paired Observation (Temporal / Multi-Sensor)' : 'Single Observation (VQA / Grounding)'}
          </p>
        </div>

        {/* Toggle Single vs Pair */}
        <div className="inline-flex rounded-lg bg-space-950 p-0.5 border border-space-750 font-mono text-[10px]">
          <button
            onClick={() => {
              onToggleDualMode(false);
              onSelectPair(null);
            }}
            className={`px-2.5 py-1 rounded-md transition-all ${
              !isDualMode
                ? 'bg-space-800 text-radar-cyan font-semibold border border-radar-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Single
          </button>
          <button
            onClick={() => {
              onToggleDualMode(true);
              if (!pairImage && primaryImage?.pair_id) {
                const partner = samples.find(s => s.id === primaryImage.pair_id);
                if (partner) onSelectPair(partner);
              }
            }}
            className={`px-2.5 py-1 rounded-md transition-all ${
              isDualMode
                ? 'bg-space-800 text-radar-cyan font-semibold border border-radar-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pair (T1 + T2 / SAR)
          </button>
        </div>
      </div>

      {/* Preset Scenario Quick Chips */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-radar-cyan" />
          <span>Quick Scenarios</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => handleLoadScenario('temporal')}
            className="text-left px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700/80 hover:border-radar-cyan/50 text-[11px] font-mono text-slate-200 transition-colors"
          >
            <div className="font-semibold text-radar-cyan">2022 vs 2025</div>
            <div className="text-[10px] text-slate-400">Urban Expansion Pair</div>
          </button>
          <button
            onClick={() => handleLoadScenario('multimodal')}
            className="text-left px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700/80 hover:border-indigo-400/50 text-[11px] font-mono text-slate-200 transition-colors"
          >
            <div className="font-semibold text-indigo-400">Optical + SAR</div>
            <div className="text-[10px] text-slate-400">S2 Optical / S1 Radar</div>
          </button>
          <button
            onClick={() => handleLoadScenario('airport')}
            className="text-left px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700/80 hover:border-emerald-400/50 text-[11px] font-mono text-slate-200 transition-colors"
          >
            <div className="font-semibold text-emerald-400">Airport Hub</div>
            <div className="text-[10px] text-slate-400">Aircraft & Runway VQA</div>
          </button>
          <button
            onClick={() => handleLoadScenario('harbor')}
            className="text-left px-2.5 py-1.5 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700/80 hover:border-amber-400/50 text-[11px] font-mono text-slate-200 transition-colors"
          >
            <div className="font-semibold text-amber-400">Cargo Port</div>
            <div className="text-[10px] text-slate-400">Container Terminal</div>
          </button>
        </div>
      </div>

      {/* Primary Image Card */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
          <span>{isDualMode ? 'Observation 1 (Baseline / Optical)' : 'Selected Satellite Capture'}</span>
          {primaryImage && (
            <span className="text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Loaded</span>
            </span>
          )}
        </div>

        {primaryImage ? (
          <div className="p-3 rounded-lg bg-space-850 border border-space-700 text-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono font-semibold text-white truncate max-w-[200px]">
                  {primaryImage.filename}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{primaryImage.title}</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                primaryImage.modality === 'SAR'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30'
              }`}>
                {primaryImage.modality}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300 pt-2 border-t border-space-750">
              <div className="flex items-center space-x-1">
                <Compass className="w-3 h-3 text-slate-400" />
                <span>{primaryImage.crs}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Maximize2 className="w-3 h-3 text-slate-400" />
                <span>{primaryImage.gsd_meters} m GSD</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{primaryImage.acquisition_date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>{primaryImage.width}×{primaryImage.height} px</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-space-950 border border-dashed border-space-700 text-center text-xs text-slate-400 font-mono">
            No primary raster loaded
          </div>
        )}
      </div>

      {/* Secondary Image Card (if dual mode) */}
      {isDualMode && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Observation 2 (Epoch T2 / SAR Complement)</span>
            {pairImage && (
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Paired</span>
              </span>
            )}
          </div>

          {pairImage ? (
            <div className="p-3 rounded-lg bg-space-850 border border-space-700 text-xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-semibold text-white truncate max-w-[200px]">
                    {pairImage.filename}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{pairImage.title}</div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  pairImage.modality === 'SAR'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30'
                }`}>
                  {pairImage.modality}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300 pt-2 border-t border-space-750">
                <div className="flex items-center space-x-1">
                  <Compass className="w-3 h-3 text-slate-400" />
                  <span>{pairImage.crs}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Maximize2 className="w-3 h-3 text-slate-400" />
                  <span>{pairImage.gsd_meters} m GSD</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{pairImage.acquisition_date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ImageIcon className="w-3 h-3 text-slate-400" />
                  <span>{pairImage.width}×{pairImage.height} px</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-space-950 border border-dashed border-amber-500/40 text-center text-xs text-amber-400 font-mono">
              Pair observation missing. Select a paired sample or upload secondary raster.
            </div>
          )}
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      <div 
        onClick={() => onUploadClick(false)}
        className="border border-dashed border-space-700 hover:border-radar-cyan/60 rounded-lg p-3.5 text-center bg-space-950/60 hover:bg-space-850/40 cursor-pointer transition-all group"
      >
        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-radar-cyan mx-auto mb-1.5 transition-colors" />
        <div className="text-xs font-semibold text-slate-200">Drop satellite imagery here</div>
        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
          Supported: GeoTIFF • TIFF • PNG • JPEG
        </div>
      </div>

      {/* Upload Action Buttons */}
      <div className="flex space-x-2 pt-1">
        <button
          onClick={() => onUploadClick(false)}
          className="flex-1 py-2 px-3 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-xs font-mono font-medium text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-radar-cyan" />
          <span>Upload Image</span>
        </button>
        <button
          onClick={() => onUploadClick(true)}
          className="flex-1 py-2 px-3 rounded-lg bg-space-800 hover:bg-space-750 border border-space-700 text-xs font-mono font-medium text-slate-200 transition-colors flex items-center justify-center space-x-1.5"
        >
          <Split className="w-3.5 h-3.5 text-blue-400" />
          <span>Upload Pair</span>
        </button>
      </div>
    </div>
  );
};
