import React, { useEffect, useState } from 'react';
import { History, Calendar, MapPin, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { fetchSatelliteHistory } from '../services/satelliteApi';

interface SatelliteHistoryViewProps {
  onSelectAnalysis: (item: any) => void;
}

export const SatelliteHistoryView: React.FC<SatelliteHistoryViewProps> = ({ onSelectAnalysis }) => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSatelliteHistory()
      .then((data) => setHistoryItems(data))
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Genuine Satellite Analysis History</h2>
            <p className="text-xs text-slate-400">Archived remote-sensing assessments with persistent geospatial polygons</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono">{historyItems.length} Records</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading archived satellite analyses...</div>
      ) : historyItems.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
          No previous satellite analyses stored. Execute an analysis on the map to archive results.
        </div>
      ) : (
        <div className="space-y-2.5">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
              onClick={() => onSelectAnalysis(item)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-mono font-semibold">
                    {item.satellite || 'Sentinel-2'}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    "{item.query}"
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {item.natural_language_summary}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span>Date: {item.created_at?.slice(0, 10) || 'Recent'}</span>
                  <span>Model: {item.model_name}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnalysis(item);
                }}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition border border-slate-700/60 shrink-0"
              >
                <span>Load on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
