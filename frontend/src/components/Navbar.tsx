import React from 'react';
import { Satellite, Layers, RefreshCw, History, Info, ShieldCheck, Activity, Map } from 'lucide-react';

export type NavTab = 'dashboard' | 'analyze' | 'compare' | 'history' | 'about';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTelemetry: () => void;
  stacConnected?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenTelemetry,
  stacConnected = true
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-2.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Satellite className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-wider text-slate-100 font-mono">
                Sat<span className="text-cyan-400">Query</span>
              </h1>
              <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                Earth Observation
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              AI Satellite Imagery Analysis Platform
            </p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-950/80 border border-slate-800 rounded-xl p-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Map },
            { id: 'analyze', label: 'Analyze', icon: Layers },
            { id: 'compare', label: 'Compare', icon: RefreshCw },
            { id: 'history', label: 'History', icon: History },
            { id: 'about', label: 'About', icon: Info }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as NavTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Telemetry Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:text-cyan-300 transition"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">STAC / AI Telemetry</span>
          </button>
        </div>
      </div>
    </header>
  );
};
