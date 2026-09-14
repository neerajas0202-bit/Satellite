import React from 'react';
import { 
  Radar, 
  Layers, 
  GitCompare, 
  Binary, 
  FileText, 
  FlaskConical, 
  Sparkles,
  Activity,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, backendOnline }) => {
  const navItems = [
    { id: 'analyze' as PageView, label: 'Analyze', icon: Radar, badge: 'CORE' },
    { id: 'compare' as PageView, label: 'Compare', icon: GitCompare, badge: 'TEMPORAL' },
    { id: 'optical_sar' as PageView, label: 'Optical + SAR', icon: Binary, badge: 'FUSION' },
    { id: 'reports' as PageView, label: 'Reports', icon: FileText, badge: null },
    { id: 'evaluation' as PageView, label: 'Evaluation', icon: FlaskConical, badge: 'BENCH' },
  ];

  return (
    <aside className="w-64 bg-space-900 border-r border-space-750 flex flex-col justify-between shrink-0 select-none z-30 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div 
          onClick={() => onNavigate('landing')}
          className="p-5 border-b border-space-750 cursor-pointer hover:bg-space-850/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-600/30 border border-radar-cyan/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <Radio className="w-5 h-5 text-radar-cyan animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base tracking-wider text-white">SATQUERY</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/40">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight leading-tight mt-0.5">
                Multimodal RS Intelligence
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-space-800 text-slate-400 border border-space-700/60 inline-flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse"></span>
            SIH 2026 // Problem SIH26167
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-3 py-1.5">
            Mission Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-radar-cyan/20 to-blue-600/10 text-radar-cyan border border-radar-cyan/40 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                    : 'text-slate-300 hover:text-white hover:bg-space-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-radar-cyan' : 'text-slate-400'}`} />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive 
                      ? 'bg-radar-cyan/20 text-radar-cyan border border-radar-cyan/30' 
                      : 'bg-space-800 text-slate-400 border border-space-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: System Status */}
      <div className="p-4 border-t border-space-750 bg-space-950/60">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
          <span>System Status</span>
          <Activity className="w-3 h-3 text-radar-cyan" />
        </div>
        <div className="space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${backendOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-rose-500'}`}></span>
              AI Engine
            </span>
            <span className={backendOnline ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
              {backendOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              Model Registry
            </span>
            <span className="text-emerald-400 font-semibold">Ready (5/5)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              Geospatial Engine
            </span>
            <span className="text-emerald-400 font-semibold">Ready</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-space-800 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>v2.5 // SIH 2026</span>
          <span className="text-radar-cyan">ISRO / EO Ready</span>
        </div>
      </div>
    </aside>
  );
};
