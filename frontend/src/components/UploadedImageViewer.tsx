import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Eye, Sparkles, MapPin, Maximize2, AlertCircle, Globe } from 'lucide-react';
import { UploadedImageMeta } from '../services/satelliteApi';
import { SatelliteAnalysisResult } from '../types';

interface UploadedImageViewerProps {
  imageMeta: UploadedImageMeta | null;
  analysisResult: SatelliteAnalysisResult | null;
  activeLayer: 'natural' | 'ndvi' | 'ndwi' | 'false_color';
  onLayerChange: (layer: 'natural' | 'ndvi' | 'ndwi' | 'false_color') => void;
  layerOpacity: number;
  onOpacityChange: (opacity: number) => void;
}

export const UploadedImageViewer: React.FC<UploadedImageViewerProps> = ({
  imageMeta,
  analysisResult,
  activeLayer,
  onLayerChange,
  layerOpacity,
  onOpacityChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);
  const rasterOverlayRef = useRef<L.ImageOverlay | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  const isGeoreferenced = imageMeta?.is_georeferenced && imageMeta.bbox && imageMeta.bbox.length === 4;

  // Initialize or update Leaflet map for Georeferenced images
  useEffect(() => {
    if (!mapContainerRef.current || !isGeoreferenced || !imageMeta?.bbox) return;

    const [minLon, minLat, maxLon, maxLat] = imageMeta.bbox;
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    map.fitBounds(bounds);

    // Overlay uploaded image at its real geographic coordinates
    if (imageOverlayRef.current) {
      map.removeLayer(imageOverlayRef.current);
    }
    imageOverlayRef.current = L.imageOverlay(imageMeta.preview_url, bounds, { opacity: 0.9 }).addTo(map);

  }, [imageMeta, isGeoreferenced]);

  // Update AI Prediction GeoJSON on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isGeoreferenced) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    if (analysisResult?.geojson && analysisResult.geojson.features?.length) {
      geojsonLayerRef.current = L.geoJSON(analysisResult.geojson as any, {
        style: (feature) => {
          const color = feature?.properties?.color || '#00f0ff';
          return {
            color: color,
            weight: 2,
            opacity: 0.9,
            fillColor: color,
            fillOpacity: 0.45
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setSelectedFeature(feature.properties);
          });
          const p = feature.properties || {};
          layer.bindTooltip(`
            <div class="font-sans text-xs bg-slate-900 text-white p-1.5 rounded border border-cyan-500/50">
              <strong class="text-cyan-400">${p.class || 'Detected Feature'}</strong><br/>
              Area: ${p.area_ha || 0} ha (${p.area_km2 || 0} km²)<br/>
              Confidence: ${(p.confidence ? (p.confidence * 100).toFixed(1) : '90')}%
            </div>
          `, { sticky: true });
        }
      }).addTo(map);
    }
  }, [analysisResult, isGeoreferenced]);

  // Active overlay image
  const getActiveOverlayUrl = () => {
    if (!analysisResult) return imageMeta?.preview_url;
    if (activeLayer === 'ndvi') return analysisResult.overlays?.ndvi;
    if (activeLayer === 'ndwi') return analysisResult.overlays?.ndwi;
    if (activeLayer === 'false_color') return analysisResult.overlays?.false_color;
    return imageMeta?.preview_url;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden border border-slate-800 rounded-xl">
      {/* Top Header Badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 border shadow-xl ${
          isGeoreferenced
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
            : 'bg-slate-900/90 text-slate-300 border-slate-700/80'
        }`}>
          {isGeoreferenced ? (
            <>
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Georeferenced Map View ({imageMeta?.crs})</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>High-Res Image-Space Visualizer</span>
            </>
          )}
        </div>
      </div>

      {/* Layer Switcher & Opacity */}
      {analysisResult && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1.5 border-b border-slate-800">
            <span className="flex items-center gap-1 text-cyan-400">
              <Layers className="w-3.5 h-3.5" /> Spectral Layers
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs">
            {[
              { id: 'natural', label: 'Uploaded Image' },
              { id: 'false_color', label: 'False Color CIR' },
              { id: 'ndvi', label: 'NDVI Vegetation' },
              { id: 'ndwi', label: 'NDWI Water' }
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => onLayerChange(l.id as any)}
                className={`px-2 py-1 rounded text-[11px] font-medium text-left transition ${
                  activeLayer === l.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Opacity slider */}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <Eye className="w-3 h-3 text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] font-mono w-7 text-right">{Math.round(layerOpacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {imageMeta ? (
        isGeoreferenced ? (
          /* Georeferenced Leaflet Map */
          <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />
        ) : (
          /* Non-Georeferenced High-Res Image Viewer */
          <div className="w-full h-full flex items-center justify-center p-4 bg-slate-950 relative overflow-auto">
            <div className="relative max-w-full max-h-full rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
              {/* Base Uploaded Image */}
              <img
                src={imageMeta.preview_url}
                alt="Uploaded Satellite Scene"
                className="max-w-full max-h-[75vh] object-contain rounded"
              />

              {/* Spectral / AI Overlay */}
              {activeLayer !== 'natural' && getActiveOverlayUrl() && (
                <img
                  src={getActiveOverlayUrl()}
                  alt="AI Prediction Overlay"
                  style={{ opacity: layerOpacity }}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity"
                />
              )}
            </div>

            {/* Non-Georeferenced Info Banner */}
            <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 text-amber-300/90 text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xl">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Non-georeferenced image: Calculations are performed in pixel-space without fabricated GPS coordinates.</span>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-600">
            <Layers className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-300">No Image Uploaded</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Upload a satellite or aerial image on the left panel to begin genuine remote-sensing AI analysis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
