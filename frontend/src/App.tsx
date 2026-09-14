import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ImageUploadZone } from './components/ImageUploadZone';
import { UploadedImageViewer } from './components/UploadedImageViewer';
import { AIQueryControls } from './components/AIQueryControls';
import { ScientificResultsPanel } from './components/ScientificResultsPanel';
import { TemporalUploadCompare } from './components/TemporalUploadCompare';
import { SatelliteHistoryView } from './components/SatelliteHistoryView';
import { AboutView } from './components/AboutView';
import { SystemStatusModal } from './components/SystemStatusModal';
import { analyzeUploadedImage, UploadedImageMeta } from './services/satelliteApi';
import { SatelliteAnalysisResult } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // Uploaded Image State
  const [currentImage, setCurrentImage] = useState<UploadedImageMeta | null>(null);

  // Query & Metadata
  const [query, setQuery] = useState('Detect flooded areas and surface water in this image');
  const [satellite, setSatellite] = useState('Sentinel-2 Optical');
  const [acquisitionDate, setAcquisitionDate] = useState('');

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SatelliteAnalysisResult | null>(null);

  // Visualizer Layers
  const [activeLayer, setActiveLayer] = useState<'natural' | 'ndvi' | 'ndwi' | 'false_color'>('natural');
  const [layerOpacity, setLayerOpacity] = useState(0.85);

  const handleRunAnalysis = async () => {
    if (!currentImage) {
      setAnalysisError('Please upload a satellite or aerial image to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await analyzeUploadedImage({
        image_id: currentImage.id,
        query,
        satellite_type: satellite,
        acquisition_date: acquisitionDate || undefined
      });

      if (res.status === 'error') {
        setAnalysisError(res.message || 'Analysis could not be completed on the uploaded image.');
        setAnalysisResult(null);
      } else {
        setAnalysisResult(res);
        if (res.task_type === 'water_flood_segmentation') {
          setActiveLayer('ndwi');
        } else if (res.task_type === 'vegetation_loss_analysis') {
          setActiveLayer('ndvi');
        } else {
          setActiveLayer('false_color');
        }
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to connect to image analysis pipeline.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadArchivedAnalysis = (item: any) => {
    setQuery(item.query);
    setSatellite(item.satellite || 'Sentinel-2 Optical');
    setAnalysisResult({
      status: 'completed',
      id: item.id,
      query: item.query,
      task_type: item.task_type,
      intent: item.task_type?.replace(/_/g, ' ').toUpperCase(),
      bbox: item.bbox,
      satellite: item.satellite || 'Sentinel-2 Optical',
      metrics: item.metrics || {},
      geojson: item.geojson || { type: 'FeatureCollection', features: [] },
      natural_language_summary: item.natural_language_summary
    });
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
      />

      {/* Main Views */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentTab === 'dashboard' || currentTab === 'analyze' ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-[1800px] mx-auto w-full">
            {/* Center/Left: Uploaded Image Visualizer (Map if georeferenced, High-Res Canvas if image-space) */}
            <div className="lg:col-span-8 flex flex-col h-[550px] lg:h-[calc(100vh-80px)]">
              <UploadedImageViewer
                imageMeta={currentImage}
                analysisResult={analysisResult}
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                layerOpacity={layerOpacity}
                onOpacityChange={setLayerOpacity}
              />
            </div>

            {/* Right Column: Upload Zone + AI Query Controls + Scientific Results */}
            <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-1 max-h-[calc(100vh-80px)]">
              <ImageUploadZone
                currentImage={currentImage}
                onImageUploaded={(meta) => {
                  setCurrentImage(meta);
                  setAnalysisResult(null);
                  setAnalysisError(null);
                }}
                onClearImage={() => {
                  setCurrentImage(null);
                  setAnalysisResult(null);
                }}
              />

              <AIQueryControls
                query={query}
                onQueryChange={setQuery}
                satellite={satellite}
                onSatelliteChange={setSatellite}
                acquisitionDate={acquisitionDate}
                onAcquisitionDateChange={setAcquisitionDate}
                hasImage={currentImage !== null}
                onRunAnalysis={handleRunAnalysis}
                isAnalyzing={isAnalyzing}
                analysisError={analysisError}
              />

              <ScientificResultsPanel result={analysisResult} />
            </div>
          </div>
        ) : currentTab === 'compare' ? (
          <div className="flex-1 overflow-y-auto py-6">
            <TemporalUploadCompare />
          </div>
        ) : currentTab === 'history' ? (
          <div className="flex-1 overflow-y-auto py-6">
            <SatelliteHistoryView onSelectAnalysis={handleLoadArchivedAnalysis} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-6">
            <AboutView />
          </div>
        )}
      </main>

      {/* System Telemetry & Transparency Modal */}
      <SystemStatusModal
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
      />
    </div>
  );
};

export default App;
