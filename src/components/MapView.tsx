import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HexagonData, DemandCenter, ScenarioConfig } from '../types';
import { getColorForCost } from '../utils/colorUtils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  hexagonData: HexagonData[];
  demandCenters: DemandCenter[];
  selectedHexagon: HexagonData | null;
  onHexagonSelect: (hexagon: HexagonData | null) => void;
  scenarioConfig: ScenarioConfig;
}

const MapController: React.FC<{ hexagonData: HexagonData[] }> = ({ hexagonData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (hexagonData.length > 0) {
      const bounds = L.geoJSON({
        type: 'FeatureCollection',
        features: hexagonData.map(hex => ({
          type: 'Feature',
          geometry: hex.geometry,
          properties: hex.properties
        }))
      }).getBounds();
      
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [hexagonData, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  hexagonData,
  demandCenters,
  selectedHexagon,
  onHexagonSelect,
  scenarioConfig,
}) => {
  const mapRef = useRef<L.Map>(null);

  const getHexagonStyle = (hexagon: HexagonData) => {
    // Use the first demand center for coloring if available
    const firstDemand = demandCenters[0];
    if (!firstDemand) {
      return {
        fillColor: '#94a3b8',
        weight: 1,
        opacity: 0.8,
        color: '#64748b',
        fillOpacity: 0.6,
      };
    }

    const costKey = `${firstDemand.name} lowest cost`;
    const cost = hexagon.properties[costKey] || 0;
    
    return {
      fillColor: getColorForCost(cost),
      weight: selectedHexagon?.id === hexagon.id ? 3 : 1,
      opacity: 1,
      color: selectedHexagon?.id === hexagon.id ? '#1f2937' : '#64748b',
      fillOpacity: 0.7,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const hexagon = hexagonData.find(h => h.id === feature.properties.id);
    if (!hexagon) return;

    layer.on({
      click: () => onHexagonSelect(hexagon),
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: '#1f2937',
          fillOpacity: 0.8,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getHexagonStyle(hexagon));
      },
    });

    // Create popup content
    const firstDemand = demandCenters[0];
    const costKey = firstDemand ? `${firstDemand.name} lowest cost` : null;
    const cost = costKey ? hexagon.properties[costKey] : null;

    layer.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold text-gray-900 mb-2">Hexagon ${hexagon.id}</h3>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">Country:</span> ${hexagon.properties.country}</p>
          <p><span class="font-medium">Solar Potential:</span> ${hexagon.properties.theo_pv?.toFixed(1) || 'N/A'} MW</p>
          <p><span class="font-medium">Wind Potential:</span> ${hexagon.properties.theo_wind?.toFixed(1) || 'N/A'} MW</p>
          ${cost ? `<p><span class="font-medium">LCOH:</span> €${cost.toFixed(2)}/kg</p>` : ''}
          <p><span class="font-medium">Ocean Distance:</span> ${hexagon.properties.ocean_dist?.toFixed(1) || 'N/A'} km</p>
          <p><span class="font-medium">Road Distance:</span> ${hexagon.properties.road_dist?.toFixed(1) || 'N/A'} km</p>
        </div>
      </div>
    `);
  };

  const geoJsonData = {
    type: 'FeatureCollection' as const,
    features: hexagonData.map(hexagon => ({
      type: 'Feature' as const,
      geometry: hexagon.geometry,
      properties: { ...hexagon.properties, id: hexagon.id },
    })),
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hydrogen Production Cost Map</h2>
        <p className="text-gray-600">
          Explore the spatial variation in hydrogen production costs across {scenarioConfig.country} for {scenarioConfig.weatherYear}.
          Click on hexagons to view detailed information.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <MapContainer
          ref={mapRef}
          center={[-22.5, 17.0]} // Namibia center
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController hexagonData={hexagonData} />
          
          {hexagonData.length > 0 && (
            <GeoJSON
              key={`${scenarioConfig.country}-${scenarioConfig.weatherYear}`}
              data={geoJsonData}
              style={getHexagonStyle}
              onEachFeature={onEachFeature}
            />
          )}

          {demandCenters.map((center, index) => (
            <Marker key={index} position={[center.lat, center.lon]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900 mb-2">{center.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Annual Demand:</span> {center.annualDemand.toLocaleString()} kg/year</p>
                    <p><span class="font-medium">Demand State:</span> {center.demandState}</p>
                    <p><span className="font-medium">Location:</span> {center.lat.toFixed(3)}°, {center.lon.toFixed(3)}°</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {selectedHexagon && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Hexagon {selectedHexagon.id}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Solar Potential</p>
              <p className="text-gray-900">{selectedHexagon.properties.theo_pv?.toFixed(1) || 'N/A'} MW</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Wind Potential</p>
              <p className="text-gray-900">{selectedHexagon.properties.theo_wind?.toFixed(1) || 'N/A'} MW</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Ocean Distance</p>
              <p className="text-gray-900">{selectedHexagon.properties.ocean_dist?.toFixed(1) || 'N/A'} km</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Road Distance</p>
              <p className="text-gray-900">{selectedHexagon.properties.road_dist?.toFixed(1) || 'N/A'} km</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};