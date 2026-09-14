import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Crosshair, 
  Eye, EyeOff, Layers, Sparkles, MapPin, Gauge,
  Split, GitCompare, Compass, Filter
} from 'lucide-react';
import { ImageMetadata, BoundingBox, SpectralLayer } from '../types';

export type ViewMode = 'original' | 'changes' | 'evidence' | 'grounding';
export type TemporalViewTab = 'before' | 'after' | 'change_map';

interface SatelliteViewerProps {
  primaryImage: ImageMetadata | null;
  pairImage?: ImageMetadata | null;
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
  onSelectBox: (label: string | null) => void;
  spectralLayer: SpectralLayer;
  setSpectralLayer: (layer: SpectralLayer) => void;
  showBoxes: boolean;
  setShowBoxes: (show: boolean) => void;
  temporalTab?: TemporalViewTab;
  onChangeTemporalTab?: (tab: TemporalViewTab) => void;
  viewMode?: ViewMode;
  onChangeViewMode?: (mode: ViewMode) => void;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  primaryImage,
  pairImage,
  boundingBoxes,
  selectedBoxId,
  onSelectBox,
  spectralLayer,
  setSpectralLayer,
  showBoxes,
  setShowBoxes,
  temporalTab = 'after',
  onChangeTemporalTab,
  viewMode = 'evidence',
  onChangeViewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number; lat: string; lon: string }>({
    x: 0,
    y: 0,
    lat: "28°36'48\"N",
    lon: "77°12'32\"E",
  });
  const [showReticle, setShowReticle] = useState<boolean>(true);
  const [hoveredBox, setHoveredBox] = useState<BoundingBox | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active displayed image depending on temporal tab
  const activeImage = (pairImage && temporalTab === 'before') ? pairImage : primaryImage;

  // Reset viewport when active image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [activeImage?.id]);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relX = Math.round(e.clientX - rect.left);
      const relY = Math.round(e.clientY - rect.top);
      
      const baseLat = 28.6139 + (relY / 8000);
      const baseLon = 77.2090 + (relX / 8000);
      
      setMouseCoords({
        x: relX,
        y: relY,
        lat: `${baseLat.toFixed(5)}°N`,
        lon: `${baseLon.toFixed(5)}°E`,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.5), 4.5));
  };

  // Spectral filter CSS styling
  const getFilterStyle = (): React.CSSProperties => {
    switch (spectralLayer) {
      case 'cir':
        return { filter: 'contrast(1.3) hue-rotate(180deg) saturate(1.8)' };
      case 'ndvi':
        return { filter: 'invert(0.9) hue-rotate(90deg) contrast(1.7) saturate(2.5)' };
      case 'sar':
        return { filter: 'grayscale(1) contrast(2.2) brightness(1.2)' };
      default:
        return { filter: 'none' };
    }
  };

  // Overlay badge tag
  const sensorBadge = activeImage?.modality === 'SAR'
    ? 'SENTINEL-1 • SAR C-BAND'
    : activeImage?.sensor_type?.toUpperCase()?.includes('WORLDVIEW')
    ? 'WORLDVIEW-3 • 0.3M OPTICAL'
    : 'SENTINEL-2 • OPTICAL L2A';

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[520px] bg-space-950 overflow-hidden rounded-xl border border-space-750 flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Background Reticle Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      {/* TOP HUD BAR: Mode Switcher & Overlay Badge */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
        {/* Sensor & CRS Badge */}
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded bg-space-900/90 backdrop-blur border border-radar-cyan/40 text-[11px] font-mono font-bold text-radar-cyan flex items-center space-x-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-radar-cyan animate-ping"></span>
            <span>{sensorBadge}</span>
          </div>

          <div className="hidden md:flex items-center px-2 py-1 rounded bg-space-900/90 backdrop-blur border border-space-700 text-[10px] font-mono text-slate-300">
            <span>CRS: {activeImage?.crs || 'EPSG:4326'}</span>
            <span className="mx-1.5 text-slate-500">•</span>
            <span>GSD: {activeImage?.gsd_meters || 10}m</span>
          </div>
        </div>

        {/* View Mode Switcher: Original | Changes | Evidence | Grounding */}
        {onChangeViewMode && (
          <div className="hidden sm:inline-flex rounded-lg bg-space-900/90 backdrop-blur p-0.5 border border-space-700 font-mono text-[10px] shadow-lg">
            {[
              { id: 'original' as ViewMode, label: 'Original' },
              { id: 'changes' as ViewMode, label: 'Changes' },
              { id: 'evidence' as ViewMode, label: 'Evidence' },
              { id: 'grounding' as ViewMode, label: 'Grounding' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => onChangeViewMode(m.id)}
                className={`px-2.5 py-1 rounded transition-all ${
                  viewMode === m.id
                    ? 'bg-radar-cyan text-space-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {/* Zoom & Fullscreen Controls */}
        <div className="flex items-center space-x-1 bg-space-900/90 backdrop-blur p-1 rounded-lg border border-space-700 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded hover:bg-space-800 text-slate-300 hover:text-radar-cyan transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded hover:bg-space-800 text-slate-300 hover:text-radar-cyan transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-space-800 text-slate-300 hover:text-white transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-space-800 text-slate-300 hover:text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TEMPORAL TOGGLE BAR (When pair is loaded): BEFORE | AFTER | CHANGE */}
      {pairImage && onChangeTemporalTab && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="inline-flex rounded-lg bg-space-900/90 backdrop-blur p-1 border border-space-700 shadow-xl font-mono text-xs">
            <button
              onClick={() => onChangeTemporalTab('before')}
              className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                temporalTab === 'before'
                  ? 'bg-space-800 text-radar-cyan font-bold border border-radar-cyan/40 shadow-inner'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>BEFORE (2022)</span>
            </button>
            <button
              onClick={() => onChangeTemporalTab('after')}
              className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                temporalTab === 'after'
                  ? 'bg-space-800 text-radar-cyan font-bold border border-radar-cyan/40 shadow-inner'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>AFTER (2025)</span>
            </button>
            <button
              onClick={() => onChangeTemporalTab('change_map')}
              className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
                temporalTab === 'change_map'
                  ? 'bg-radar-cyan text-space-950 font-bold shadow-inner'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>CHANGE MAP</span>
            </button>
          </div>
        </div>
      )}

      {/* CENTER IMAGE VIEWPORT */}
      {activeImage ? (
        <div 
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="relative max-w-none max-h-none pointer-events-none"
        >
          <img
            src={activeImage.url || `/static/samples/${activeImage.filename}`}
            alt={activeImage.title || 'Satellite Image'}
            style={getFilterStyle()}
            className="max-w-[850px] max-h-[700px] object-contain rounded shadow-2xl border border-space-700"
            draggable={false}
          />

          {/* Simulated Change Map Overlay in Change Mode */}
          {temporalTab === 'change_map' && (
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-amber-500/30 mix-blend-screen pointer-events-none border-2 border-radar-cyan/60 rounded"></div>
          )}

          {/* Interactive Bounding Boxes / Visual Evidence Overlays */}
          {showBoxes && viewMode !== 'original' && boundingBoxes.map((box, idx) => {
            const isHovered = hoveredBox?.label === box.label;
            const isSelected = selectedBoxId === box.label;
            const topPct = box.ymin * 100;
            const leftPct = box.xmin * 100;
            const widthPct = (box.xmax - box.xmin) * 100;
            const heightPct = (box.ymax - box.ymin) * 100;

            const borderColor = box.color || '#00f0ff';

            return (
              <div
                key={idx}
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  height: `${heightPct}%`,
                  borderColor: borderColor,
                  backgroundColor: `${borderColor}18`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBox(box.label);
                }}
                onMouseEnter={() => setHoveredBox(box)}
                onMouseLeave={() => setHoveredBox(null)}
                className={`absolute border-2 pointer-events-auto cursor-pointer transition-all duration-150 ${
                  isSelected || isHovered
                    ? 'border-radar-cyan bg-radar-cyan/25 shadow-[0_0_20px_rgba(0,240,255,0.4)] z-10'
                    : ''
                }`}
              >
                {/* Chip Label */}
                <div 
                  style={{ backgroundColor: borderColor }}
                  className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-space-950 uppercase tracking-tight whitespace-nowrap shadow flex items-center space-x-1"
                >
                  <span>{box.label}</span>
                  <span className="bg-space-950/20 px-1 rounded text-[9px]">
                    {(box.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center font-mono text-xs text-slate-400">
          <Crosshair className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <span>No satellite imagery selected.</span>
        </div>
      )}

      {/* BOTTOM HUD READOUTS: Telemetry & Layer Toggles */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-20 pointer-events-auto">
        {/* Coordinates & Scale Readout */}
        <div className="flex items-center space-x-2 font-mono text-[11px] text-slate-300 bg-space-900/90 backdrop-blur px-3 py-1.5 rounded-lg border border-space-700 shadow-lg">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-radar-cyan" />
            <span>LAT: {mouseCoords.lat}</span>
            <span className="text-slate-500">•</span>
            <span>LON: {mouseCoords.lon}</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-radar-cyan">{(scale * 100).toFixed(0)}% ZOOM</span>
        </div>

        {/* Spectral Band Simulation Toggles */}
        <div className="flex items-center space-x-1 bg-space-900/90 backdrop-blur p-1 rounded-lg border border-space-700 shadow-lg font-mono text-[10px]">
          {[
            { id: 'natural' as SpectralLayer, label: 'True Color (RGB)' },
            { id: 'cir' as SpectralLayer, label: 'CIR False-Color' },
            { id: 'ndvi' as SpectralLayer, label: 'NDVI Proxy' },
            { id: 'sar' as SpectralLayer, label: 'SAR Sim' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setSpectralLayer(layer.id)}
              className={`px-2.5 py-1 rounded transition-all ${
                spectralLayer === layer.id
                  ? 'bg-space-800 text-radar-cyan font-bold border border-radar-cyan/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {layer.label}
            </button>
          ))}
          
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`p-1.5 rounded border transition-colors ${
              showBoxes
                ? 'bg-radar-cyan/15 text-radar-cyan border-radar-cyan/30'
                : 'bg-space-800 text-slate-400 border-space-700'
            }`}
            title="Toggle Bounding Boxes"
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
