import React from 'react';
import { ImageMetadata } from '../types';
import { Compass, Plane, Ship, Sprout, Building2, Waves } from 'lucide-react';

interface SampleSelectorProps {
  samples: ImageMetadata[];
  activeImageId: string | null;
  onSelectSample: (sample: ImageMetadata) => void;
}

export const SampleSelector: React.FC<SampleSelectorProps> = ({
  samples,
  activeImageId,
  onSelectSample,
}) => {
  const getSceneIcon = (title: string = '') => {
    const t = title.toLowerCase();
    if (t.includes('airport')) return Plane;
    if (t.includes('port') || t.includes('harbor')) return Ship;
    if (t.includes('farm') || t.includes('agriculture') || t.includes('irrigation')) return Sprout;
    if (t.includes('urban') || t.includes('metropolitan')) return Building2;
    if (t.includes('flood') || t.includes('disaster')) return Waves;
    return Compass;
  };

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span className="uppercase tracking-wider">Reference Satellite Scenes</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">5 High-Resolution Scenes</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {samples.map((sample) => {
          const isActive = sample.id === activeImageId;
          const Icon = getSceneIcon(sample.title);
          return (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`group text-left p-2 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-space-950/60 border-space-800 hover:border-space-600 hover:bg-space-850'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1 rounded ${isActive ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400 bg-space-800'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono text-slate-400 px-1 py-0.5 rounded bg-space-900">
                  {sample.gsd_meters}m GSD
                </span>
              </div>

              <div className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                {sample.title?.split('-')[0] || sample.original_name}
              </div>

              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                {sample.sensor_type?.split('(')[0] || "Optical"}
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
