import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { Dashboard } from './components/Dashboard';
import { DataUpload } from './components/DataUpload';
import { ResultsPanel } from './components/ResultsPanel';
import { HexagonData, DemandCenter, ScenarioConfig } from './types';
import { loadSampleData } from './utils/dataLoader';

function App() {
  const [activeView, setActiveView] = useState<'map' | 'dashboard' | 'upload' | 'results'>('map');
  const [hexagonData, setHexagonData] = useState<HexagonData[]>([]);
  const [demandCenters, setDemandCenters] = useState<DemandCenter[]>([]);
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonData | null>(null);
  const [scenarioConfig, setScenarioConfig] = useState<ScenarioConfig>({
    country: 'NA',
    weatherYear: 2023,
    generators: ['Solar', 'Wind'],
    transport: {
      pipelineConstruction: true,
      roadConstruction: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { hexagons, demands } = await loadSampleData();
        setHexagonData(hexagons);
        setDemandCenters(demands);
      } catch (error) {
        console.error('Failed to load sample data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleDataUpload = (data: { hexagons: HexagonData[], demands: DemandCenter[] }) => {
    setHexagonData(data.hexagons);
    setDemandCenters(data.demands);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading GeoH2 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          scenarioConfig={scenarioConfig}
          onScenarioChange={setScenarioConfig}
        />
        
        <main className="flex-1 p-6">
          {activeView === 'map' && (
            <MapView 
              hexagonData={hexagonData}
              demandCenters={demandCenters}
              selectedHexagon={selectedHexagon}
              onHexagonSelect={setSelectedHexagon}
              scenarioConfig={scenarioConfig}
            />
          )}
          
          {activeView === 'dashboard' && (
            <Dashboard 
              hexagonData={hexagonData}
              demandCenters={demandCenters}
              scenarioConfig={scenarioConfig}
            />
          )}
          
          {activeView === 'upload' && (
            <DataUpload onDataUpload={handleDataUpload} />
          )}
          
          {activeView === 'results' && (
            <ResultsPanel 
              hexagonData={hexagonData}
              demandCenters={demandCenters}
              scenarioConfig={scenarioConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;