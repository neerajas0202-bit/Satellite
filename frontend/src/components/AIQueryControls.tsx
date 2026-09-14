import React, { useState } from 'react';
import { Sparkles, Calendar, Satellite, Play, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface AIQueryControlsProps {
  query: string;
  onQueryChange: (query: string) => void;
  satellite: string;
  onSatelliteChange: (satellite: string) => void;
  acquisitionDate: string;
  onAcquisitionDateChange: (date: string) => void;
  hasImage: boolean;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  analysisError: string | null;
}

const PROMPT_SUGGESTIONS = [
  'Detect flooded areas and surface water in this image',
  'Show built-up expansion and urban structures',
  'Identify vegetation loss and canopy degradation',
  'Analyze major land-use and land-cover classes',
  'Identify buildings and infrastructure'
];

export const AIQueryControls: React.FC<AIQueryControlsProps> = ({
  query,
  onQueryChange,
  satellite,
  onSatelliteChange,
  acquisitionDate,
  onAcquisitionDateChange,
  hasImage,
  onRunAnalysis,
  isAnalyzing,
  analysisError
}) => {
  return (
    <div className="flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">AI Satellite Query</h3>
            <p className="text-[11px] text-slate-400">Natural-language remote sensing model router</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-mono text-emerald-400">
          <ShieldCheck className="w-3 h-3" /> Zero Fabrication
        </div>
      </div>

      {/* Query Input Box */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Ask SatQuery about this image (e.g. Detect flooded areas in this image...)"
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none font-sans"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => onQueryChange(suggestion)}
              className="text-[11px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded-md transition border border-slate-700/50 hover:border-cyan-500/40 text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Metadata Controls */}
      <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t border-slate-800/80">
        {/* Satellite Selection */}
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
            <Satellite className="w-3 h-3 text-cyan-400" /> Sensor / Satellite (Optional)
          </label>
          <select
            value={satellite}
            onChange={(e) => onSatelliteChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="Sentinel-2 Optical">Sentinel-2 Optical (MSI)</option>
            <option value="Sentinel-1 SAR">Sentinel-1 SAR (C-Band)</option>
            <option value="Landsat-8/9">Landsat-8/9 OLI</option>
            <option value="Aerial / Drone">Aerial / Drone RGB</option>
            <option value="Unknown / Other">Unknown / Other</option>
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
            <Calendar className="w-3 h-3 text-cyan-400" /> Acquisition Date (Optional)
          </label>
          <input
            type="date"
            value={acquisitionDate}
            onChange={(e) => onAcquisitionDateChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Error Alert */}
      {analysisError && (
        <div className="mb-3 p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Analysis Failure</strong>
            <span>{analysisError}</span>
          </div>
        </div>
      )}

      {/* Execute Button */}
      <button
        onClick={onRunAnalysis}
        disabled={isAnalyzing || !hasImage || !query.trim()}
        className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition ${
          isAnalyzing || !hasImage || !query.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-500/20'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            <span>Processing Uploaded Image & Running PyTorch AI...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{hasImage ? 'Analyze Uploaded Image' : 'Upload Image First'}</span>
          </>
        )}
      </button>
    </div>
  );
};
