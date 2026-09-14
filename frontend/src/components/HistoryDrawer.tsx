import React from 'react';
import { X, History, Trash2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { AnalysisHistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: AnalysisHistoryItem[];
  onSelectHistory: (item: AnalysisHistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectHistory,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-space-900 border-l border-space-750 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-space-800 flex items-center justify-between bg-space-950/80">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono">
              <History className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Analysis History</h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-space-800 text-slate-300">
                {historyItems.length} Records
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {historyItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-600" />
                <p>No queries executed yet.</p>
                <p className="text-[11px] text-slate-600">Ask a question to record analysis sessions.</p>
              </div>
            ) : (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-space-950/80 border border-space-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="text-cyan-400 font-semibold">{item.image_title || 'Satellite Scene'}</span>
                    <div className="flex items-center space-x-1">
                      <span>{item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Recent'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        title="Delete record"
                        className="p-1 text-slate-500 hover:text-rose-400 rounded opacity-60 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-200 font-semibold text-xs mb-1 line-clamp-2">
                    "{item.query}"
                  </div>

                  <div className="text-slate-400 text-[11px] font-sans line-clamp-2 mb-2 leading-relaxed">
                    {item.answer}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-space-850">
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Confidence: {Math.round(item.confidence * 100)}%
                    </span>
                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold text-[11px]"
                    >
                      <span>Load Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
