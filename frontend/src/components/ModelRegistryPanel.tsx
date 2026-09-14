import React from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  Layers, 
  Zap, 
  CircleDot,
  Radio
} from 'lucide-react';
import { ModelRegistryItem } from '../types';

interface ModelRegistryPanelProps {
  models: ModelRegistryItem[];
  selectedModelIds: string[];
}

export const ModelRegistryPanel: React.FC<ModelRegistryPanelProps> = ({
  models,
  selectedModelIds,
}) => {
  const defaultModels: ModelRegistryItem[] = [
    {
      id: 'vqa',
      name: 'Remote-Sensing VQA',
      task: 'Visual Question Answering',
      status: 'Ready',
      input_type: 'Optical / Multispectral + Text',
      version: 'v2.5-rs',
      description: 'Geospatial vision-language model trained on overhead perspective VQA datasets.'
    },
    {
      id: 'captioning',
      name: 'Scene Captioning',
      task: 'Dense Scene Understanding',
      status: 'Ready',
      input_type: 'Single / Multi-Band Raster',
      version: 'v1.9-rs',
      description: 'Produces structured natural-language descriptions of land-use, morphology, and infrastructure.'
    },
    {
      id: 'grounding',
      name: 'Text-Guided Grounding',
      task: 'Spatial Object & Region Grounding',
      status: 'Ready',
      input_type: 'Overhead Imagery + Text Query',
      version: 'v3.1-box',
      description: 'Extracts normalized bounding coordinates and masks for natural-language described entities.'
    },
    {
      id: 'change_detection',
      name: 'Change Detection',
      task: 'Bi-temporal Differential Analysis',
      status: 'Ready',
      input_type: 'Paired Co-registered Rasters (T1, T2)',
      version: 'v2.8-diff',
      description: 'Identifies structural expansion, vegetation loss, and infrastructural change between epochs.'
    },
    {
      id: 'optical_sar',
      name: 'Optical-SAR Analysis',
      task: 'Cross-Sensor Multimodal Fusion',
      status: 'Ready',
      input_type: 'Optical RGB/NIR + SAR VV/VH Backscatter',
      version: 'v2.0-fusion',
      description: 'Combines spectral reflectance with radar roughness and metallic double-bounce backscatter.'
    }
  ];

  const modelsList = models && models.length > 0 ? models : defaultModels;

  return (
    <div className="bg-space-900 border border-space-750 rounded-xl p-4 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-space-750">
        <div className="flex items-center space-x-2">
          <Boxes className="w-4 h-4 text-radar-cyan" />
          <h2 className="text-sm font-bold text-white tracking-wide">Model Registry</h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          5 Specialists Online
        </span>
      </div>

      {/* Models List */}
      <div className="space-y-2">
        {modelsList.map((m) => {
          const isSelected = selectedModelIds.includes(m.id);

          return (
            <div
              key={m.id}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-radar-cyan/15 to-blue-600/10 border-radar-cyan text-white shadow-[0_0_15px_rgba(0,240,255,0.12)]'
                  : 'bg-space-850/60 border-space-700/60 text-slate-300 hover:bg-space-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono tracking-wide text-white">
                      {m.name}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-radar-cyan text-space-950 font-bold uppercase tracking-wider flex items-center space-x-1">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        <span>Routed</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.task}</div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center space-x-1 font-semibold ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-space-800 text-slate-400 border border-space-700'
                  }`}>
                    <CircleDot className="w-2 h-2 fill-current" />
                    <span>{isSelected ? 'Active' : m.status}</span>
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-space-750/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Input: {m.input_type}</span>
                <span className="text-slate-400">{m.version}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
