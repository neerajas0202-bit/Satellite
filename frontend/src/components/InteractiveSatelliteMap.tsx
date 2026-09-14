import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Eye, Search, MapPin, Maximize2, Trash2, BoxSelect, Compass, Sparkles } from 'lucide-react';
import { SatelliteAnalysisResult } from '../types';

interface InteractiveSatelliteMapProps {
  bbox: number[]; // [min_lon, min_lat, max_lon, max_lat]
  onBboxChange: (bbox: number[]) => void;
  analysisResult: SatelliteAnalysisResult | null;
  activeLayer: 'natural' | 'ndvi' | 'ndwi' | 'false_color';
  onLayerChange: (layer: 'natural' | 'ndvi' | 'ndwi' | 'false_color') => void;
  layerOpacity: number;
  onOpacityChange: (opacity: number) => void;
}

const PRESET_REGIONS = [
  { name: 'Lake Mead, NV (Water/Drought)', bbox: [-114.85, 35.95, -114.55, 36.25] },
  { name: 'Valencia, Spain (Flood Inundation)', bbox: [-0.48, 39.35, -0.32, 39.52] },
  { name: 'Cairo & Nile Delta (Urban Sprawl)', bbox: [31.15, 29.95, 31.45, 30.18] },
  { name: 'Amazon Basin, Brazil (Deforestation)', bbox: [-63.20, -8.95, -62.85, -8.65] },
  { name: 'Dubai Palm, UAE (Coastal Expansion)', bbox: [55.10, 25.08, 55.18, 25.16] }
];

export const InteractiveSatelliteMap: React.FC<InteractiveSatelliteMapProps> = ({
  bbox,
  onBboxChange,
  analysisResult,
  activeLayer,
  onLayerChange,
  layerOpacity,
  onOpacityChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bboxRectRef = useRef<L.Rectangle | null>(null);
  const rasterOverlayRef = useRef<L.ImageOverlay | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [drawMode, setDrawMode] = useState<'bbox' | 'none'>('none');
  const [dragStartLatLng, setDragStartLatLng] = useState<L.LatLng | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const [minLon, minLat, maxLon, maxLat] = bbox;
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLon],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // High-res satellite basemap from Esri
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    ).addTo(map);

    // Dark canvas borders & labels
    const labelsLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      { maxZoom: 18 }
    ).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Bounding Box Rectangle on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const [minLon, minLat, maxLon, maxLat] = bbox;
    const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);

    if (bboxRectRef.current) {
      bboxRectRef.current.setBounds(bounds);
    } else {
      bboxRectRef.current = L.rectangle(bounds, {
        color: '#00f0ff',
        weight: 2,
        fillColor: '#00f0ff',
        fillOpacity: 0.1,
        dashArray: '4, 4'
      }).addTo(map);
    }
  }, [bbox]);

  // Update Raster Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (rasterOverlayRef.current) {
      map.removeLayer(rasterOverlayRef.current);
      rasterOverlayRef.current = null;
    }

    if (!analysisResult || analysisResult.status !== 'completed') return;

    const [minLon, minLat, maxLon, maxLat] = analysisResult.bbox;
    const bounds = L.latLngBounds([minLat, minLon], [maxLat, maxLon]);

    let overlayUrl: string | undefined;
    if (activeLayer === 'ndvi') {
      overlayUrl = analysisResult.overlays?.ndvi;
    } else if (activeLayer === 'ndwi') {
      overlayUrl = analysisResult.overlays?.ndwi;
    } else if (activeLayer === 'false_color') {
      overlayUrl = analysisResult.overlays?.false_color;
    } else if (activeLayer === 'natural') {
      overlayUrl = analysisResult.scene_metadata?.preview_url;
    }

    if (overlayUrl) {
      rasterOverlayRef.current = L.imageOverlay(overlayUrl, bounds, {
        opacity: layerOpacity,
        interactive: false
      }).addTo(map);
    }
  }, [analysisResult, activeLayer, layerOpacity]);

  // Update GeoJSON AI Prediction Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

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
            fillOpacity: 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setSelectedFeature(feature.properties);
          });
          const p = feature.properties || {};
          layer.bindTooltip(`
            <div class="font-sans text-xs bg-slate-900 text-white p-1 rounded border border-cyan-500/50">
              <strong class="text-cyan-400">${p.class || 'Detected Feature'}</strong><br/>
              Area: ${p.area_ha || 0} ha (${p.area_km2 || 0} km²)<br/>
              Confidence: ${(p.confidence ? (p.confidence * 100).toFixed(1) : '90')}%
            </div>
          `, { sticky: true });
        }
      }).addTo(map);
    }
  }, [analysisResult]);

  // Handle Box Selection on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (drawMode === 'bbox') {
      map.dragging.disable();
      const onMouseDown = (e: L.LeafletMouseEvent) => {
        setDragStartLatLng(e.latlng);
      };
      const onMouseUp = (e: L.LeafletMouseEvent) => {
        if (dragStartLatLng) {
          const minLat = Math.min(dragStartLatLng.lat, e.latlng.lat);
          const maxLat = Math.max(dragStartLatLng.lat, e.latlng.lat);
          const minLon = Math.min(dragStartLatLng.lng, e.latlng.lng);
          const maxLon = Math.max(dragStartLatLng.lng, e.latlng.lng);

          if (Math.abs(maxLat - minLat) > 0.005 && Math.abs(maxLon - minLon) > 0.005) {
            onBboxChange([round(minLon), round(minLat), round(maxLon), round(maxLat)]);
          }
          setDragStartLatLng(null);
          setDrawMode('none');
          map.dragging.enable();
        }
      };

      map.on('mousedown', onMouseDown);
      map.on('mouseup', onMouseUp);

      return () => {
        map.off('mousedown', onMouseDown);
        map.off('mouseup', onMouseUp);
        map.dragging.enable();
      };
    }
  }, [drawMode, dragStartLatLng, onBboxChange]);

  const round = (num: number) => Math.round(num * 10000) / 10000;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const newBbox = [round(lon - 0.08), round(lat - 0.06), round(lon + 0.08), round(lat + 0.06)];
        onBboxChange(newBbox);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 1.5 });
        }
      }
    } catch (err) {
      console.error('Geocoding search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePresetSelect = (presetBbox: number[]) => {
    onBboxChange(presetBbox);
    const centerLat = (presetBbox[1] + presetBbox[3]) / 2;
    const centerLon = (presetBbox[0] + presetBbox[2]) / 2;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerLat, centerLon], 12, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden border border-slate-800 rounded-xl">
      {/* Map Search & Region Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[95%]">
        <form onSubmit={handleSearch} className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-2xl">
          <Search className="w-4 h-4 text-cyan-400 mr-2" />
          <input
            type="text"
            placeholder="Search city, lake, region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none w-48 sm:w-64"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-medium px-2 py-1 rounded transition border border-cyan-500/30 ml-1"
          >
            {isSearching ? '...' : 'Go'}
          </button>
        </form>

        {/* Preset Selector */}
        <select
          onChange={(e) => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx)) handlePresetSelect(PRESET_REGIONS[idx].bbox);
          }}
          defaultValue=""
          className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 rounded-lg px-2.5 py-2 shadow-2xl focus:outline-none focus:border-cyan-500"
        >
          <option value="" disabled>Presets (Quick Jump)</option>
          {PRESET_REGIONS.map((p, i) => (
            <option key={i} value={i}>{p.name}</option>
          ))}
        </select>

        {/* Draw Box Tool */}
        <button
          onClick={() => setDrawMode(drawMode === 'bbox' ? 'none' : 'bbox')}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg backdrop-blur-md shadow-2xl transition border ${
            drawMode === 'bbox'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-400/50'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
          }`}
        >
          <BoxSelect className="w-3.5 h-3.5" />
          {drawMode === 'bbox' ? 'Drag on Map' : 'Select Box'}
        </button>
      </div>

      {/* Map Raster Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-2xl">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1.5 border-b border-slate-800">
          <span className="flex items-center gap-1 text-cyan-400">
            <Layers className="w-3.5 h-3.5" /> Satellite Layer
          </span>
          <span className="text-[10px] text-slate-500">
            {analysisResult?.satellite || 'Sentinel-2'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { id: 'natural', label: 'True Color RGB' },
            { id: 'false_color', label: 'False Color CIR' },
            { id: 'ndvi', label: 'NDVI Vegetation' },
            { id: 'ndwi', label: 'NDWI Water' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => onLayerChange(l.id as any)}
              className={`px-2 py-1.5 rounded text-[11px] font-medium text-left transition ${
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

      {/* Selected Polygon Info Box */}
      {selectedFeature && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> {selectedFeature.class || 'Detected Feature'}
            </span>
            <button
              onClick={() => setSelectedFeature(null)}
              className="text-slate-400 hover:text-slate-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Area (Hectares):</span>
              <span className="font-semibold text-emerald-400">{selectedFeature.area_ha} ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Area (Sq Km):</span>
              <span className="font-semibold text-slate-200">{selectedFeature.area_km2} km²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="font-semibold text-cyan-400">
                {(selectedFeature.confidence ? selectedFeature.confidence * 100 : 92).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full cursor-crosshair z-0" />

      {/* Coordinates / Bounding Box Status Footer */}
      <div className="absolute bottom-2 right-2 z-[1000] bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 text-[10px] text-slate-400 px-2.5 py-1 rounded font-mono flex items-center gap-2">
        <MapPin className="w-3 h-3 text-cyan-400" />
        <span>BBOX: [{bbox[0]}, {bbox[1]}, {bbox[2]}, {bbox[3]}]</span>
      </div>
    </div>
  );
};
