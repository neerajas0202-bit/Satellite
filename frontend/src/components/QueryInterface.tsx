import React, { useState } from 'react';
import { Send, Sparkles, Compass, ShieldAlert, Trees, Scan, MessageSquare, Terminal } from 'lucide-react';

interface QueryInterfaceProps {
  query: string;
  setQuery: (q: string) => void;
  analysisMode: string;
  setAnalysisMode: (mode: string) => void;
  onSubmit: (q?: string) => void;
  isLoading: boolean;
  suggestedQueries: string[];
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  query,
  setQuery,
  analysisMode,
  setAnalysisMode,
  onSubmit,
  isLoading,
  suggestedQueries,
}) => {
  const modes = [
    { id: 'vqa', label: 'VQA Query', icon: MessageSquare },
    { id: 'object_detection', label: 'Object & Count', icon: Scan },
    { id: 'land_cover', label: 'Land Cover / NDVI', icon: Trees },
    { id: 'change_detection', label: 'Hazard / Change', icon: ShieldAlert },
    { id: 'captioning', label: 'Auto Captioning', icon: Compass },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && query.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-3.5 shadow-xl space-y-3">
      {/* Analysis Mode Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-1.5 border-b border-space-800 pb-2.5">
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-semibold uppercase tracking-wider">Analysis Mode:</span>
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          {modes.map((m) => {
            const Icon = m.icon;
            const active = analysisMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setAnalysisMode(m.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Input Field */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-cyan-400/80 pointer-events-none">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this satellite scene (e.g., 'Count the aircraft', 'Evaluate NDVI', 'Detect water bodies')..."
          disabled={isLoading}
          className="w-full bg-space-950 border border-space-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-10 pr-28 py-3 outline-none transition-all font-sans disabled:opacity-50 shadow-inner"
        />
        <button
          onClick={() => onSubmit()}
          disabled={isLoading || !query.trim()}
          className="absolute right-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>Execute</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      {suggestedQueries.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pt-0.5 text-xs">
          <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Suggested Queries:</span>
          <div className="flex items-center space-x-1.5 pb-1">
            {suggestedQueries.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(prompt);
                  onSubmit(prompt);
                }}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-space-800/80 hover:bg-space-750 border border-space-700/80 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-[11px] transition-all flex items-center gap-1 shadow-sm"
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
