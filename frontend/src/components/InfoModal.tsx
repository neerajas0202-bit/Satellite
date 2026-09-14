import React from 'react';
import { X, Satellite, Cpu, Layers, Award, BookOpen, CheckCircle, ExternalLink } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-space-900 border border-space-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-xs font-mono">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-cyan-400 mb-4">
          <Satellite className="w-5 h-5" />
          <h2 className="text-base font-bold tracking-wider">
            SATQUERY AI — SYSTEM ARCHITECTURE & PROJECT BRIEF
          </h2>
        </div>

        <div className="space-y-4 text-slate-300 font-sans leading-relaxed">
          {/* Project Summary */}
          <div className="bg-space-950 p-4 rounded-xl border border-space-800">
            <h3 className="text-cyan-400 font-mono font-semibold text-xs uppercase mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Project Overview
            </h3>
            <p className="text-slate-300 text-xs">
              <strong>SATQUERY AI</strong> is an Interactive Multimodal Vision-Language Assistant specifically engineered for Remote Sensing (RS) and overhead earth observation imagery. It bridges computer vision (pixel-level spectral indexing, edge gradients, object localization) with natural language reasoning (RS-VQA) to answer complex queries regarding infrastructure, land cover, hydrology, and post-disaster damage.
            </p>
          </div>

          {/* Key Pipeline Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-space-950 p-3.5 rounded-xl border border-space-800">
              <h4 className="text-emerald-400 font-mono font-semibold text-xs mb-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Spectral & Surface Analytics
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>• <strong>Simulated NDVI / VARI:</strong> Chlorophyll absorption proxy.</li>
                <li>• <strong>MNDWI Water Index:</strong> Waterway & flood segmentation.</li>
                <li>• <strong>Built-Up Density:</strong> High-frequency gradient analysis.</li>
                <li>• <strong>Spectral Filters:</strong> False-Color Infrared (CIR) & SAR.</li>
              </ul>
            </div>

            <div className="bg-space-950 p-3.5 rounded-xl border border-space-800">
              <h4 className="text-purple-400 font-mono font-semibold text-xs mb-2 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Multimodal RS-VQA Engine
              </h4>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>• <strong>Object Counting:</strong> Aircraft, maritime vessels, cranes.</li>
                <li>• <strong>Contextual Reasoning:</strong> Spatial relationship inference.</li>
                <li>• <strong>Visual Evidence Bounding Boxes:</strong> Coordinate overlays.</li>
                <li>• <strong>Pluggable Adapters:</strong> Local CV Core, Gemini & GPT-4o.</li>
              </ul>
            </div>
          </div>

          {/* Demonstration Architecture Diagram */}
          <div className="bg-space-950 p-4 rounded-xl border border-space-800 font-mono text-[11px]">
            <div className="text-cyan-400 font-semibold mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Pipeline Architecture Workflow
            </div>
            <pre className="text-slate-400 overflow-x-auto p-2 bg-space-900 rounded border border-space-800">
{`Satellite Image Capture (RGB / VNIR / Panchromatic)
          │
          ├──> [Computer Vision Core] -> VARI/NDVI & Water Segmentation
          │                            -> Spatial Gradient & Structural Filter
          │                            -> Feature Localization Bounding Boxes
          │
          └──> [VLM Reasoning Head]    -> Query Intent Parsing
                                       -> Multimodal Cross-Attention
                                       -> Structured Answer + Confidence Metric`}
            </pre>
          </div>

          {/* Academic & Demonstration Notes */}
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-200">
            <strong>Demonstration Tip:</strong> Try switching between <em>"True Color"</em> and <em>"CIR (Infrared)"</em> on the Agricultural scene to see crop chlorophyll contrast, or test <em>"Count the aircraft"</em> on the International Airport scene to view target bounding boxes.
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
          >
            Close Project Guide
          </button>
        </div>
      </div>
    </div>
  );
};
