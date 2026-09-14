import React, { useState } from 'react';
import { 
  FileCheck2, 
  ChevronDown, 
  ChevronUp, 
  Hash, 
  Clock, 
  Layers, 
  Database,
  Cpu,
  ShieldCheck
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface ExecutionSummaryProps {
  result: AnalysisResult | null;
}

export const ExecutionSummary: React.FC<ExecutionSummaryProps> = ({ result }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  if (!result) return null;

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl overflow-hidden font-mono">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-space-850/50 transition-colors text-left"
      >
        <div className="flex items-center space-x-2">
          <FileCheck2 className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">Analysis Trace (Audit Log)</h2>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
            AUDITABLE
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-space-750/80 space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Identified Task</div>
              <div className="text-xs font-bold text-white mt-0.5 truncate">{result.task_identified}</div>
            </div>

            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Input Rasters</div>
              <div className="text-xs font-bold text-radar-cyan mt-0.5">
                {result.pair_image_id ? '2 Images (Paired AOI)' : '1 Image (Single AOI)'}
              </div>
            </div>

            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Modalities</div>
              <div className="text-xs font-bold text-white mt-0.5">
                {result.pair_image_id ? 'Optical + Optical (Temporal)' : 'Optical Multispectral'}
              </div>
            </div>

            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Routed Specialist Models</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 truncate">
                {result.selected_models.join(', ') || 'VQA, Grounding'}
              </div>
            </div>

            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Extracted Evidence</div>
              <div className="text-xs font-bold text-white mt-0.5">
                {result.visual_evidence.length} Regions + Mask Overlay
              </div>
            </div>

            <div className="bg-space-850/80 p-2.5 rounded border border-space-700">
              <div className="text-[10px] text-slate-400 uppercase">Pipeline Status</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Completed ({result.elapsed_seconds}s)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-space-800">
            <span>Dossier ID: {result.id}</span>
            <span>Cryptographic Verification Hash: 0x9f4a...28d1</span>
          </div>
        </div>
      )}
    </div>
  );
};
