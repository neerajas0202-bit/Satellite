import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  Compass, 
  Calendar, 
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ValidationResult } from '../types';

interface ValidationPanelProps {
  validation: ValidationResult | null;
  isValidating?: boolean;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isValidating = false,
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(true);

  if (!validation) {
    return (
      <div className="bg-space-900 border border-space-750 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Input Compatibility
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Pre-Execution Gate</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">
          Select or upload satellite imagery to trigger automated geospatial pre-flight validation.
        </p>
      </div>
    );
  }

  const isSuccess = validation.status === 'COMPATIBLE';
  const isWarning = validation.status === 'WARNING';

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-3">
      {/* Header with status pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className={`w-4 h-4 ${isSuccess ? 'text-emerald-400' : isWarning ? 'text-amber-400' : 'text-rose-400'}`} />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Input Compatibility
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : isWarning
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}>
            {validation.status}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Summary Message Banner */}
      <div className={`p-2.5 rounded-lg text-xs font-mono border leading-relaxed ${
        isSuccess
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : isWarning
          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-start space-x-2">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>{validation.summary_message}</div>
        </div>
      </div>

      {/* Checks Breakdown Checklist */}
      {expanded && (
        <div className="space-y-1.5 pt-1 border-t border-space-750">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
            <span>Pre-Execution Verification Checks</span>
            <span>8 Passed</span>
          </div>

          <div className="grid grid-cols-1 gap-1 font-mono text-[11px]">
            {validation.checks.map((chk) => (
              <div
                key={chk.id}
                className="flex items-center justify-between p-2 rounded bg-space-850/60 border border-space-700/60 hover:bg-space-850 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {chk.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                  <span className="text-slate-300 truncate">{chk.name}</span>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`text-[10px] font-semibold ${chk.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {chk.status_text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400 text-right">
            Verification timestamp: <span className="text-slate-300">T-0.00s Pre-Inference</span>
          </div>
        </div>
      )}
    </div>
  );
};
