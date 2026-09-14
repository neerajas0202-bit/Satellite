import React from 'react';
import { 
  Globe, 
  Satellite, 
  Settings, 
  User, 
  ShieldCheck, 
  Database,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { PageView } from '../types';

interface HeaderProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  selectedDataset: string;
  onSelectDataset: (dataset: string) => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  selectedDataset,
  onSelectDataset,
  onOpenSettings,
}) => {
  const datasets = [
    { id: 'sentinel-2', name: 'Sentinel-2 MSI (10m Optical)' },
    { id: 'sentinel-1', name: 'Sentinel-1 C-SAR (Radar)' },
    { id: 'landsat-8', name: 'Landsat-8 OLI/TIRS (30m)' },
    { id: 'worldview-3', name: 'WorldView-3 (0.3m High-Res)' },
    { id: 'bigearthnet', name: 'BigEarthNet-MM Benchmark' },
  ];

  return (
    <header className="h-14 bg-space-900/90 backdrop-blur border-b border-space-750 px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left Title & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Satellite className="w-5 h-5 text-radar-cyan" />
          <h1 className="font-bold text-sm tracking-wider text-white">SatQuery AI</h1>
        </div>

        <div className="h-4 w-[1px] bg-space-700 hidden sm:block"></div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>REMOTE-SENSING AI • ONLINE</span>
        </div>

        <div className="hidden lg:inline-flex items-center px-2 py-0.5 rounded bg-space-800 border border-space-700 text-[10px] font-mono text-slate-400">
          CRS: EPSG:4326 // WGS 84
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Dataset Selector */}
        <div className="relative flex items-center">
          <Database className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedDataset}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="bg-space-800 hover:bg-space-750 text-slate-200 pl-8 pr-8 py-1.5 rounded-lg border border-space-700 text-xs font-mono focus:outline-none focus:border-radar-cyan transition-colors cursor-pointer appearance-none"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* DEMO MODE Badge */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">DEMO MODE</span>
        </div>

        {/* Overview link */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-space-800 transition-colors hidden sm:flex items-center space-x-1 font-mono"
        >
          <span>Overview</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 border border-transparent hover:border-space-700 transition-colors"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        {/* User / Demo profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-space-750">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white text-xs font-semibold shadow-inner border border-radar-cyan/30">
            SQ
          </div>
          <div className="hidden xl:block text-left font-mono">
            <div className="text-[11px] font-medium text-slate-200 leading-none">ISRO Analyst</div>
            <div className="text-[9px] text-slate-400 leading-none mt-0.5">SIH-26167</div>
          </div>
        </div>
      </div>
    </header>
  );
};
