import React from 'react';
import { 
  Binary, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CloudSun, 
  Radio, 
  Layers, 
  Maximize2,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { ImageMetadata, MultimodalResult } from '../types';

interface OpticalSARViewerProps {
  opticalImage: ImageMetadata | null;
  sarImage: ImageMetadata | null;
  multimodalResult: MultimodalResult | null;
  onRunMultimodal: () => void;
  isLoading: boolean;
}

export const OpticalSARViewer: React.FC<OpticalSARViewerProps> = ({
  opticalImage,
  sarImage,
  multimodalResult,
  onRunMultimodal,
  isLoading,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-space-900 border border-space-750 p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Binary className="w-5 h-5 text-radar-cyan" />
            <h1 className="text-lg font-bold text-white tracking-wide">
              Optical + SAR Multimodal Analysis
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              CROSS-MODAL FUSION
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Joint interpretation exploiting optical VNIR spectral reflectance and Sentinel-1 microwave radar backscatter.
          </p>
        </div>

        <button
          onClick={onRunMultimodal}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isLoading ? 'Computing Multimodal Fusion...' : 'Run Joint Multimodal Fusion'}</span>
        </button>
      </div>

      {/* Sensor Synergy Diagram / Flow */}
      <div className="bg-space-900 border border-space-750 p-4 rounded-xl text-center font-mono text-xs">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">
          Cross-Sensor Sensor Fusion Architecture
        </div>
        <div className="inline-flex items-center space-x-2 bg-space-950 px-4 py-2 rounded-lg border border-space-800 text-slate-300">
          <span className="text-cyan-400 font-bold">OPTICAL (Spectral / Color)</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
            MULTIMODAL DEEP FUSION
          </span>
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span className="text-amber-400 font-bold">SAR (Radar / Structural)</span>
        </div>
      </div>

      {/* 3 Columns: Optical Image | Combined Analysis / Results | SAR Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Optical Image */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-cyan-400 flex items-center space-x-1.5">
              <CloudSun className="w-3.5 h-3.5" />
              <span>Optical Sensor</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
              Sentinel-2 MSI
            </span>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden border border-space-700 bg-space-950 flex items-center justify-center">
            {opticalImage ? (
              <img
                src={opticalImage.url || `/static/samples/${opticalImage.filename}`}
                alt="Optical Scene"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400 font-mono">No optical image loaded</div>
            )}
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-space-900/90 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
              SPECTRAL REFLECTANCE (VNIR)
            </div>
          </div>

          <div className="p-3 rounded bg-space-850 border border-space-700 text-xs space-y-1 font-mono">
            <div className="font-bold text-slate-200">Strengths & Information:</div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Provides multi-band optical color, surface texture, vegetation chlorophyll response (NDVI), and sediment turbidity in open water. Vulnerable to cloud occlusion and nocturnal absence.
            </p>
          </div>
        </div>

        {/* Center: Combined Analysis & Fusion Telemetry */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-radar-cyan" />
              <span>Joint Multimodal Result</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Confidence: 94%
            </span>
          </div>

          {/* Fusion Narrative Card */}
          <div className="p-3.5 rounded-lg bg-gradient-to-b from-space-850 to-space-900 border border-space-700 text-xs font-sans leading-relaxed space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-radar-cyan font-bold">
              Complementary Synergy Analysis
            </div>
            <p className="text-slate-200 text-xs">
              Optical and SAR provide fundamentally complementary physics: optical reflects molecular material composition, while C-band radar measures dielectric roughness and vertical geometries.
            </p>
          </div>

          {/* Key Complementary Findings */}
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded bg-space-850/80 border border-space-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white">Built-up Urban Footprint</span>
                <span className="text-emerald-400 text-[10px]">Complementary (93.8%)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                Optical high-reflectance matched with SAR dihedral double-bounce (-5.2 dB). Cloud shadows completely discounted.
              </p>
            </div>

            <div className="p-2.5 rounded bg-space-850/80 border border-space-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white">Water & Shoreline Edge</span>
                <span className="text-emerald-400 text-[10px]">High Precision (97.2%)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                Specular radar reflection (&lt; -22 dB) guarantees sub-meter land-water boundary delineation regardless of cloud cover.
              </p>
            </div>

            <div className="p-2.5 rounded bg-space-850/80 border border-space-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white">Steel Infrastructure & Vessels</span>
                <span className="text-radar-cyan text-[10px]">SAR Dihedral Spike</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-1">
                Metallic crane booms and container hulls pierce through semi-transparent cirrus clouds with zero attenuation.
              </p>
            </div>
          </div>

          <div className="mt-auto p-2 rounded bg-space-950 border border-space-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Built-up Overlap Agreement: 93.8%</span>
            <span>Cloud Penetration: 100%</span>
          </div>
        </div>

        {/* Right: SAR Image */}
        <div className="bg-space-900 border border-space-750 rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-space-750 font-mono text-xs">
            <span className="font-bold text-amber-400 flex items-center space-x-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>SAR Microwave Radar</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700">
              Sentinel-1 C-SAR
            </span>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden border border-space-700 bg-space-950 flex items-center justify-center">
            {sarImage ? (
              <img
                src={sarImage.url || `/static/samples/${sarImage.filename}`}
                alt="SAR Scene"
                className="w-full h-full object-cover grayscale contrast-150"
              />
            ) : (
              <div className="text-xs text-slate-400 font-mono">No SAR image loaded</div>
            )}
            <div className="absolute top-2 right-2 px-2 py-1 rounded bg-space-900/90 text-[10px] font-mono text-amber-400 border border-amber-500/30">
              C-BAND BACKSCATTER (VV/VH)
            </div>
          </div>

          <div className="p-3 rounded bg-space-850 border border-space-700 text-xs space-y-1 font-mono">
            <div className="font-bold text-slate-200">Strengths & Information:</div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              Penetrates clouds, smoke, and nocturnal darkness. Sensitive to surface roughness, dielectric moisture content, and metallic double-bounce corner reflectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
