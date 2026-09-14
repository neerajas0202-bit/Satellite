import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Building,
  Trees,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { KeyFinding } from '../types';

interface ResultsPanelProps {
  answer: string;
  keyFindings: KeyFinding[];
  confidence: number;
  isDemo?: boolean;
  taskIdentified?: string;
  elapsedSeconds?: number;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  answer,
  keyFindings,
  confidence,
  isDemo = true,
  taskIdentified = 'Multitemporal Change Analysis',
  elapsedSeconds = 4.8,
}) => {
  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">AI Analysis</h2>
        </div>

        <div className="flex items-center space-x-2">
          {isDemo && (
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              DEMO SAMPLE
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400">
            {elapsedSeconds}s Execution
          </span>
        </div>
      </div>

      {/* Primary Answer Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-space-850 to-space-900 border border-space-700/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-radar-cyan to-emerald-400"></div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-radar-cyan mb-1 flex items-center justify-between">
          <span>Grounded Natural-Language Briefing</span>
          <span>{taskIdentified}</span>
        </div>
        <p className="text-sm text-slate-100 font-sans leading-relaxed font-normal">
          {answer}
        </p>
      </div>

      {/* Structured Key Findings */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Key Geospatial Findings</span>
          <span className="text-slate-400">Quantitative Telemetry</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {keyFindings.map((finding, idx) => {
            const isPositive = finding.status === 'positive';
            const isWarning = finding.status === 'warning';

            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-space-850/80 border border-space-700 hover:border-space-600 transition-colors"
              >
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {finding.category}
                </div>
                <div className={`text-base font-bold font-mono mt-1 ${
                  isPositive 
                    ? 'text-emerald-400' 
                    : isWarning 
                    ? 'text-amber-400' 
                    : 'text-radar-cyan'
                }`}>
                  {finding.value}
                </div>
                {finding.description && (
                  <div className="text-[10px] text-slate-400 mt-1 font-sans line-clamp-2 leading-tight">
                    {finding.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Disclaimer */}
      {isDemo && (
        <div className="text-[10px] font-mono text-slate-400 bg-space-950 p-2 rounded border border-space-800 flex items-start space-x-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Values and bounding coordinates generated in Demo Mode for SIH evaluation. Model registry supports drop-in PyTorch / GDAL backends for live Earth Observation sensors.
          </span>
        </div>
      )}
    </div>
  );
};
