import React, { useState } from 'react';
import { 
  GitCompare, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Building, 
  Trees, 
  Waves, 
  Route, 
  Sparkles,
  FileCheck2,
  ShieldCheck,
  Split,
  Layers
} from 'lucide-react';
import { ImageMetadata, CompareResult } from '../types';

interface CompareViewerProps {
  beforeImage: ImageMetadata | null;
  afterImage: ImageMetadata | null;
  compareResult: CompareResult | null;
  onRunCompare: () => void;
  onGenerateReport: () => void;
  isLoading: boolean;
}

export const CompareViewer: React.FC<CompareViewerProps> = ({
  beforeImage,
  afterImage,
  compareResult,
  onRunCompare,
  onGenerateReport,
  isLoading,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100% split wipe
  const [timelineEpoch, setTimelineEpoch] = useState<number>(2025); // 2022 to 2025

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-space-750 p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-radar-cyan" />
            <h1 className="text-lg font-bold text-white tracking-wide">
              Multitemporal Change Analysis
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-radar-cyan/15 text-radar-cyan border border-radar-cyan/30">
              SENTINEL-2 BI-TEMPORAL
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Differential pixel analysis and machine vision feature extraction between observation epochs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRunCompare}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Computing Differences...' : 'Run Change Analysis'}</span>
          </button>
          <button
            onClick={onGenerateReport}
            className="px-4 py-2 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 text-xs font-mono font-semibold transition-colors flex items-center space-x-1.5"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Generate Change Report</span>
          </button>
        </div>
      </div>

      {/* 3-Column Visual Layout: Before Image | Interactive Change Map / Wipe | After Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Before Image (2022) */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-slate-200">Before Observation</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
              2022-03-15 (T1)
            </span>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden border border-space-700 bg-space-950 flex items-center justify-center">
            {beforeImage ? (
              <img
                src={beforeImage.url || `/static/samples/${beforeImage.filename}`}
                alt="Before Scene"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400 font-mono">No 2022 image loaded</div>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-space-900/90 text-[10px] font-mono text-slate-300 border border-space-700">
              EPOCH 2022 • BASELINE
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-slate-200">10m GSD</span>
            </div>
            <div className="flex justify-between">
              <span>Sensor:</span>
              <span className="text-slate-200">Sentinel-2 MSI</span>
            </div>
            <div className="flex justify-between">
              <span>Built-up Ratio:</span>
              <span className="text-slate-200">34.4%</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Split Wipe & Change Map */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-radar-cyan flex items-center space-x-1.5">
              <Split className="w-3.5 h-3.5" />
              <span>Interactive Change Map</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-radar-cyan/10 text-radar-cyan border border-radar-cyan/30">
              ΔT: 2.9 YEARS
            </span>
          </div>

          {/* Wipe Viewer */}
          <div className="relative aspect-square rounded-lg overflow-hidden border border-space-700 bg-space-950">
            {/* Base Image (After) */}
            {afterImage && (
              <img
                src={afterImage.url || `/static/samples/${afterImage.filename}`}
                alt="After Scene Base"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Clipped Before Image */}
            {beforeImage && (
              <div 
                style={{ width: `${sliderPos}%` }}
                className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-radar-cyan shadow-2xl"
              >
                <img
                  src={beforeImage.url || `/static/samples/${beforeImage.filename}`}
                  alt="Before Scene Clipped"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            )}

            {/* Split Slider Handle */}
            <div 
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -ml-3 flex items-center pointer-events-none"
            >
              <div className="w-6 h-6 rounded-full bg-space-900 border-2 border-radar-cyan shadow-lg flex items-center justify-center text-radar-cyan text-[10px] font-bold">
                ⬄
              </div>
            </div>

            {/* Overlay Labels */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-space-900/90 text-[10px] font-mono text-radar-cyan border border-radar-cyan/40">
              2022
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-space-900/90 text-[10px] font-mono text-blue-400 border border-blue-400/40">
              2025
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Wipe Before (2022)</span>
              <span>{sliderPos}% Split</span>
              <span>Wipe After (2025)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="w-full h-1.5 bg-space-800 rounded-lg appearance-none cursor-pointer accent-radar-cyan"
            />
          </div>
        </div>

        {/* Right: After Image (2025) */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-slate-200">After Observation</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
              2025-02-20 (T2)
            </span>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden border border-space-700 bg-space-950 flex items-center justify-center">
            {afterImage ? (
              <img
                src={afterImage.url || `/static/samples/${afterImage.filename}`}
                alt="After Scene"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400 font-mono">No 2025 image loaded</div>
            )}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-space-900/90 text-[10px] font-mono text-slate-300 border border-space-700">
              EPOCH 2025 • DEVELOPMENT
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-slate-200">10m GSD</span>
            </div>
            <div className="flex justify-between">
              <span>Sensor:</span>
              <span className="text-slate-200">Sentinel-2 MSI</span>
            </div>
            <div className="flex justify-between">
              <span>Built-up Ratio:</span>
              <span className="text-emerald-400 font-bold">52.8% (+18.4%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="bg-space-900 border border-space-750 rounded-xl p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-radar-cyan" />
            <span>Observation Timeline</span>
          </span>
          <span className="text-radar-cyan font-bold text-sm">
            Selected Epoch: {timelineEpoch}
          </span>
        </div>

        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="2022"
            max="2025"
            step="1"
            value={timelineEpoch}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTimelineEpoch(val);
              setSliderPos(val === 2022 ? 100 : val === 2025 ? 0 : 50);
            }}
            className="w-full h-2 bg-space-800 rounded-lg appearance-none cursor-pointer accent-radar-cyan"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
            <span>2022 (March Baseline)</span>
            <span>2023 (Interim Grading)</span>
            <span>2024 (Arterial Construction)</span>
            <span className="text-radar-cyan font-bold">2025 (February Present)</span>
          </div>
        </div>
      </div>

      {/* Detected Changes Quantitative Cards */}
      <div className="bg-space-900 border border-space-750 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-space-750">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Detected Changes</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated spatial differentiation and semantic categorization
            </p>
          </div>
          <div className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Confidence: 91%
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-mono">
          <div className="p-3.5 rounded-lg bg-space-850 border border-space-700">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Building className="w-3.5 h-3.5 text-radar-cyan" />
              <span>Built-up Expansion</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-2">+18.4%</div>
            <div className="text-[10px] text-slate-400 mt-1">48,200 m² new impervious</div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-850 border border-space-700">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>New Structures</span>
            </div>
            <div className="text-xl font-bold text-blue-400 mt-2">24 Detected</div>
            <div className="text-[10px] text-slate-400 mt-1">Warehouse & industrial</div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-850 border border-space-700">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Trees className="w-3.5 h-3.5 text-amber-400" />
              <span>Vegetation Change</span>
            </div>
            <div className="text-xl font-bold text-amber-400 mt-2">-6.2%</div>
            <div className="text-[10px] text-slate-400 mt-1">Canopy clearing in East</div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-850 border border-space-700">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span>Water Bodies</span>
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-2">+0.5%</div>
            <div className="text-[10px] text-slate-400 mt-1">Retention pond stable</div>
          </div>

          <div className="p-3.5 rounded-lg bg-space-850 border border-space-700">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Route className="w-3.5 h-3.5 text-indigo-400" />
              <span>Road Development</span>
            </div>
            <div className="text-xl font-bold text-indigo-400 mt-2">+3.8 km</div>
            <div className="text-[10px] text-slate-400 mt-1">Dual 6-lane carriageway</div>
          </div>
        </div>

        {/* Change Narrative */}
        <div className="p-4 rounded-lg bg-space-950 border border-space-800 text-xs text-slate-300 font-sans leading-relaxed">
          <strong>Synthesized Change Summary:</strong> Between March 2022 and February 2025, the analyzed sector underwent significant infrastructural transition. The south-central agricultural quadrant was repurposed into a commercial logistics terminal, accompanied by an arterial highway widening from 2 lanes to 6 divided lanes. Contiguous tree canopy reduced by 6.2%, while surface hydrological reservoirs exhibited stable perimeter geometry.
        </div>
      </div>
    </div>
  );
};
