import React from 'react';
import { 
  Radar, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  GitCompare, 
  Binary, 
  Crosshair, 
  ShieldCheck, 
  CheckCircle2, 
  Database,
  Cpu,
  FileCheck2
} from 'lucide-react';
import { PageView } from '../types';

interface LandingHeroProps {
  onLaunch: () => void;
  onExploreDemo: () => void;
  onNavigate: (view: PageView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLaunch,
  onExploreDemo,
  onNavigate,
}) => {
  return (
    <div className="min-h-full bg-space-950 text-slate-100 overflow-y-auto">
      {/* Background Glows & Grid */}
      <div className="relative isolate px-6 pt-10 pb-20 lg:px-12 max-w-7xl mx-auto">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        {/* SIH Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-space-850 border border-radar-cyan/30 text-xs font-mono text-radar-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <span className="w-2 h-2 rounded-full bg-radar-cyan animate-ping"></span>
            <span>SMART INDIA HACKATHON 2026 // PROBLEM SIH26167</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center mt-8 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
            Ask Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-radar-cyan via-blue-400 to-indigo-300">Satellite Imagery.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-7 text-slate-300">
            SatQuery AI turns natural-language questions into evidence-grounded remote-sensing analysis across sensors and time. Not just a chatbot—an autonomous geospatial intelligence analyst.
          </p>

          <div className="mt-8 flex items-center justify-center gap-x-4">
            <button
              onClick={onLaunch}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all flex items-center space-x-2"
            >
              <span>Launch SatQuery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="px-6 py-3 rounded-lg bg-space-850 hover:bg-space-800 text-slate-200 border border-space-700 hover:border-radar-cyan/40 font-semibold text-sm transition-all flex items-center space-x-2 font-mono"
            >
              <Sparkles className="w-4 h-4 text-radar-cyan" />
              <span>Explore Demo (2022 vs 2025)</span>
            </button>
          </div>
        </div>

        {/* Interactive Visual Pipeline */}
        <div className="mt-16 bg-space-900/80 border border-space-750 rounded-2xl p-6 shadow-2xl backdrop-blur">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-4 text-center">
            Autonomous Agentic Reasoning Flow
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {[
              { step: '01', title: 'QUERY', desc: 'Natural-Language Question', icon: Sparkles, color: 'text-cyan-400' },
              { step: '02', title: 'AGENT', desc: 'Task Routing & Validation', icon: Cpu, color: 'text-blue-400' },
              { step: '03', title: 'MODELS', desc: 'VQA, Change, SAR Ensemble', icon: Layers, color: 'text-indigo-400' },
              { step: '04', title: 'EVIDENCE', desc: 'Boxes, Difference Maps, Masks', icon: Crosshair, color: 'text-amber-400' },
              { step: '05', title: 'ANSWER', desc: 'Verified Grounded Telemetry', icon: CheckCircle2, color: 'text-emerald-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-space-850/80 border border-space-700/60 rounded-xl p-3.5 flex flex-col items-center">
                  <div className="text-[10px] font-mono text-slate-400">{item.step}</div>
                  <Icon className={`w-5 h-5 my-1.5 ${item.color}`} />
                  <div className="text-xs font-bold text-white tracking-wider">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Pillars / Capabilities Section */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              One Question. Multiple Models. One Answer.
            </h2>
            <p className="text-sm text-slate-400 mt-2 font-mono">
              Designed for ISRO, Earth Observation scientists, and disaster response teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: VQA */}
            <div 
              onClick={() => onNavigate('analyze')}
              className="bg-space-900 border border-space-750 hover:border-radar-cyan/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] group"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-radar-cyan mb-4 group-hover:scale-105 transition-transform">
                <Radar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Remote-Sensing VQA</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ask arbitrary questions about overhead satellite scenes: entity counts, land-cover distributions, and infrastructure status.
              </p>
              <div className="mt-4 text-xs font-mono text-radar-cyan flex items-center space-x-1">
                <span>Try Single-Image VQA</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Change Detection */}
            <div 
              onClick={() => onNavigate('compare')}
              className="bg-space-900 border border-space-750 hover:border-radar-cyan/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <GitCompare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Multitemporal Change</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Understand what changed over time. Quantify urban expansion (+18.4%), new construction, and vegetation loss between temporal epochs.
              </p>
              <div className="mt-4 text-xs font-mono text-blue-400 flex items-center space-x-1">
                <span>Explore 2022 vs 2025</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Optical + SAR */}
            <div 
              onClick={() => onNavigate('optical_sar')}
              className="bg-space-900 border border-space-750 hover:border-radar-cyan/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Optical + SAR Fusion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Combine complementary sensor information. Cross-correlate optical spectral reflectance with all-weather radar microwave backscatter.
              </p>
              <div className="mt-4 text-xs font-mono text-indigo-400 flex items-center space-x-1">
                <span>Inspect Multimodal Fusion</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Grounding */}
            <div 
              onClick={() => onNavigate('analyze')}
              className="bg-space-900 border border-space-750 hover:border-radar-cyan/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <Crosshair className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Spatial Grounding</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Locate objects and geographic regions directly from natural-language queries with coordinate bounding boxes and confidence gauges.
              </p>
              <div className="mt-4 text-xs font-mono text-amber-400 flex items-center space-x-1">
                <span>View Grounding Coordinates</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Benchmarks Footer */}
        <div className="mt-16 p-6 rounded-2xl bg-space-900/60 border border-space-750 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Compatible Constellations & Formats</div>
            <div className="text-sm font-medium text-slate-200 mt-1">
              Sentinel-1 • Sentinel-2 • Landsat-8 • WorldView-3 • GeoTIFF • Cloud-Optimized GeoTIFF (COG)
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => onNavigate('evaluation')}
              className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-750 text-xs font-mono text-slate-200 border border-space-700 transition-colors"
            >
              View Benchmarks (RSVQA / CDVQA)
            </button>
            <button 
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 rounded-lg bg-space-800 hover:bg-space-750 text-xs font-mono text-slate-200 border border-space-700 transition-colors"
            >
              Intelligence Dossiers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
