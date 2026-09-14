import React from 'react';
import { 
  Send, 
  Sparkles, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  Loader2,
  Terminal
} from 'lucide-react';

interface QueryBoxProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onSubmitQuery: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const QueryBox: React.FC<QueryBoxProps> = ({
  query,
  onChangeQuery,
  onSubmitQuery,
  isLoading,
  disabled = false,
}) => {
  const quickChips = [
    { label: 'Detect Change', query: 'What changed between these two images?' },
    { label: 'Describe Scene', query: 'Describe this satellite image in detail.' },
    { label: 'Find Buildings', query: 'Where are the buildings and built-up infrastructure?' },
    { label: 'Analyze Vegetation', query: 'Evaluate vegetation canopy vigor and NDVI distribution.' },
    { label: 'Compare Sensors', query: 'Use optical and SAR data to identify built-up and water-covered regions.' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !disabled && query.trim()) {
        onSubmitQuery();
      }
    }
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">Ask SatQuery</h2>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Natural Language RS-VQA</span>
      </div>

      {/* Query Input Box */}
      <div className="relative">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your satellite imagery... (e.g. 'What changed between these two images?')"
          disabled={isLoading || disabled}
          className="w-full bg-space-950 border border-space-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-400 font-sans focus:outline-none focus:border-radar-cyan focus:ring-1 focus:ring-radar-cyan/50 resize-none transition-all"
        />
      </div>

      {/* Quick Query Chips */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-radar-cyan" />
          <span>Suggested Queries</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onChangeQuery(chip.query)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-md bg-space-850 hover:bg-space-800 border border-space-700/80 hover:border-radar-cyan/50 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Large Analyze Query Button */}
      <button
        onClick={onSubmitQuery}
        disabled={isLoading || disabled || !query.trim()}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-xs tracking-wider uppercase font-mono transition-all flex items-center justify-center space-x-2 ${
          isLoading
            ? 'bg-space-800 text-slate-400 cursor-wait border border-space-700'
            : !query.trim() || disabled
            ? 'bg-space-850 text-slate-400 cursor-not-allowed border border-space-750'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.25)]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-radar-cyan" />
            <span>Agentic Pipeline Executing...</span>
          </>
        ) : (
          <>
            <span>Analyze Query</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
