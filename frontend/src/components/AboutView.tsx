import React from 'react';
import { ShieldCheck, Satellite, Cpu, Globe, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Title */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">About SatQuery</h1>
            <p className="text-xs text-slate-400">Autonomous Remote-Sensing & Earth Observation Intelligence Platform</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl mb-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-300 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Zero-Fabrication Guarantee</span>
          </div>
          SatQuery never fabricates analysis results, fake confidence scores, or pre-rendered mock responses. Every single query queries live open STAC satellite archives (Sentinel-1 SAR / Sentinel-2 Optical), performs authentic raster band computations, runs actual PyTorch computer-vision inference models, and vectorizes pixel masks into geographic polygons.
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-100">Core Pipeline Workflow</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="font-mono text-cyan-400 text-xs font-bold block mb-1">01. STAC Ingestion</span>
              <p className="text-[11px] text-slate-400">Queries Microsoft Planetary Computer and AWS Earth Search catalogs for matching Sentinel scenes.</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="font-mono text-cyan-400 text-xs font-bold block mb-1">02. Raster Analytics</span>
              <p className="text-[11px] text-slate-400">Extracts multispectral bands and computes NDVI, NDWI, NDBI, and SAR backscatter.</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="font-mono text-cyan-400 text-xs font-bold block mb-1">03. PyTorch Models</span>
              <p className="text-[11px] text-slate-400">Executes modular convolutional & segmentation models on GPU/CPU.</p>
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <span className="font-mono text-cyan-400 text-xs font-bold block mb-1">04. Vectorization</span>
              <p className="text-[11px] text-slate-400">Maps pixel masks to GeoJSON polygons and calculates exact geodesic hectares.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
