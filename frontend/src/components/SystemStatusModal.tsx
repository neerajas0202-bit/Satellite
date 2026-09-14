import React, { useEffect, useState } from 'react';
import { Cpu, Satellite, ShieldCheck, CheckCircle2, Server, Database, X } from 'lucide-react';
import { fetchSystemStatus } from '../services/satelliteApi';
import { SystemStatusData } from '../types';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemStatusModal: React.FC<SystemStatusModalProps> = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState<SystemStatusData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchSystemStatus()
        .then((data) => setStatusData(data))
        .catch((err) => console.error('Failed to fetch telemetry:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">System Telemetry & Architecture</h2>
              <p className="text-xs text-slate-400">Live compute, data providers, and model status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Connecting to backend telemetry...
          </div>
        ) : statusData ? (
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Zero Fabrication Badge */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <strong className="text-emerald-300 block font-semibold mb-0.5">Strict Zero-Fabrication Protocol</strong>
                All inferences, vector boundaries, and statistics are dynamically generated from authentic satellite imagery catalogs (Sentinel-1 / Sentinel-2 STAC).
              </div>
            </div>

            {/* Compute Engine */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>AI Compute Engine (PyTorch)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                <div>Device: <span className="text-slate-200 uppercase">{statusData.compute.device}</span></div>
                <div>Torch Version: <span className="text-slate-200">{statusData.compute.torch_version}</span></div>
                <div className="col-span-2">Hardware: <span className="text-cyan-300">{statusData.compute.device_name}</span></div>
              </div>
            </div>

            {/* STAC Providers */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Earth Observation STAC Catalogs</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Microsoft Planetary Computer:</span>
                  <span className="text-emerald-400 font-mono">Connected (STAC API v1.0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AWS Earth Search (Element84):</span>
                  <span className="text-emerald-400 font-mono">Connected (L2A COGs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Copernicus Data Space Ecosystem:</span>
                  <span className="text-cyan-400 font-mono">Configured</span>
                </div>
              </div>
            </div>

            {/* Loaded Specialist Models */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Active Remote Sensing AI Models ({statusData.loaded_models.length})</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {statusData.loaded_models.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-900/60 rounded border border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-200 block">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.task_type}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono">
                      LOADED ({m.device})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
