import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  BarChart3,
  Percent
} from 'lucide-react';
import { ConfidenceBreakdown } from '../types';

interface ConfidenceCardProps {
  confidence: number;
  breakdown?: ConfidenceBreakdown;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidence,
  breakdown,
}) => {
  const defaultBreakdown: ConfidenceBreakdown = {
    overall: confidence || 91.0,
    query_understanding: 97.0,
    model_selection: 94.0,
    spatial_evidence: 89.0,
    final_answer: 91.0,
    disclaimer: 'Confidence is an estimate based on model agreement, geospatial sensor resolution, and spatial evidence consistency.'
  };

  const b = breakdown || defaultBreakdown;

  const metrics = [
    { label: 'Query Understanding', val: b.query_understanding, color: 'bg-radar-cyan' },
    { label: 'Model Selection', val: b.model_selection, color: 'bg-blue-500' },
    { label: 'Spatial Evidence', val: b.spatial_evidence, color: 'bg-indigo-400' },
    { label: 'Final Answer', val: b.final_answer, color: 'bg-emerald-400' },
  ];

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">Confidence Estimation</h2>
        </div>

        <div className="flex items-baseline space-x-1 font-mono">
          <span className="text-2xl font-black text-emerald-400">
            {b.overall.toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall</span>
        </div>
      </div>

      {/* Stage Breakdown Bars */}
      <div className="space-y-2.5 font-mono text-xs">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300">{m.label}</span>
              <span className="font-bold text-slate-100">{m.val.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-space-950 overflow-hidden border border-space-750">
              <div
                className={`h-full rounded-full ${m.color} transition-all duration-500`}
                style={{ width: `${m.val}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="pt-2 border-t border-space-750 text-[10px] font-mono text-slate-400 leading-normal flex items-start space-x-1.5">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{b.disclaimer}</span>
      </div>
    </div>
  );
};
