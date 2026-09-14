import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Radio,
  ArrowDown
} from 'lucide-react';
import { ExecutionTraceStep } from '../types';

interface AgentTraceProps {
  trace: ExecutionTraceStep[];
  isLoading: boolean;
}

export const AgentTrace: React.FC<AgentTraceProps> = ({ trace, isLoading }) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // When loading starts, animate sequential active steps
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setActiveStepIndex(0);
      timer = setInterval(() => {
        setActiveStepIndex((prev) => (prev < 6 ? prev + 1 : prev));
      }, 500);
    } else {
      setActiveStepIndex(7); // all done
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const defaultSteps: ExecutionTraceStep[] = [
    { step_num: '01', name: 'Query Understanding', description: 'Identifying required analysis...', status: 'pending' },
    { step_num: '02', name: 'Input Validation', description: 'Checking image compatibility...', status: 'pending' },
    { step_num: '03', name: 'Model Selection', description: 'Selecting specialist models...', status: 'pending' },
    { step_num: '04', name: 'Remote-Sensing Analysis', description: 'Running selected models...', status: 'pending' },
    { step_num: '05', name: 'Evidence Generation', description: 'Extracting spatial evidence...', status: 'pending' },
    { step_num: '06', name: 'Validation', description: 'Cross-checking model outputs...', status: 'pending' },
    { step_num: '07', name: 'Response Generation', description: 'Generating grounded answer...', status: 'pending' },
  ];

  const stepsToRender = trace && trace.length > 0 ? trace : defaultSteps;

  const toggleDetail = (stepNum: string) => {
    setExpandedDetails(prev => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">SatQuery Agent</h2>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-radar-cyan bg-radar-cyan/10 px-2 py-0.5 rounded border border-radar-cyan/30 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>STAGE {activeStepIndex + 1}/7 ACTIVE</span>
            </span>
          ) : trace && trace.length > 0 ? (
            <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>PIPELINE VERIFIED</span>
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400">Standby</span>
          )}
        </div>
      </div>

      {/* Sequential Pipeline Visualizer */}
      <div className="space-y-1.5 font-mono text-xs">
        {stepsToRender.map((step, idx) => {
          const isComplete = !isLoading && (step.status === 'completed' || (trace.length > 0));
          const isRunning = isLoading && activeStepIndex === idx;
          const isPending = isLoading && activeStepIndex < idx;
          const hasDetails = Boolean(step.details);
          const isDetailOpen = Boolean(expandedDetails[step.step_num]);

          return (
            <div key={step.step_num} className="relative">
              <div
                onClick={() => hasDetails && toggleDetail(step.step_num)}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                  isRunning
                    ? 'bg-radar-cyan/10 border-radar-cyan text-white shadow-[0_0_15px_rgba(0,240,255,0.15)] animate-pulse'
                    : isComplete
                    ? 'bg-space-850/80 border-space-700 hover:border-space-600 text-slate-200 cursor-pointer'
                    : 'bg-space-950/40 border-space-800 text-slate-400'
                }`}
              >
                {/* Step info */}
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isRunning
                      ? 'bg-radar-cyan text-space-950'
                      : isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-space-800 text-slate-400'
                  }`}>
                    {step.step_num}
                  </span>

                  <div className="min-w-0">
                    <div className="font-semibold text-xs tracking-wide text-white truncate">
                      {step.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  {step.latency_ms && isComplete && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {step.latency_ms}ms
                    </span>
                  )}
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-radar-cyan" />
                  ) : isComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-space-700 bg-space-800"></div>
                  )}
                  {hasDetails && (
                    <button className="text-slate-400 hover:text-white">
                      {isDetailOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Details */}
              {isDetailOpen && step.details && (
                <div className="mt-1 p-2 rounded bg-space-950 border border-space-750 text-[11px] text-slate-300 font-sans leading-relaxed">
                  {step.details}
                </div>
              )}

              {/* Connecting line */}
              {idx < stepsToRender.length - 1 && (
                <div className="w-[1px] h-1.5 bg-space-750 mx-auto my-0.5"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
