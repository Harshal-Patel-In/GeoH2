import React, { useState } from 'react';
import { Download, Filter, Eye, BarChart3 } from 'lucide-react';
import { HexagonData, DemandCenter, ScenarioConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ResultsPanelProps {
  hexagonData: HexagonData[];
  demandCenters: DemandCenter[];
  scenarioConfig: ScenarioConfig;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  hexagonData,
  demandCenters,
  scenarioConfig,
}) => {
  const [selectedDemandCenter, setSelectedDemandCenter] = useState<string>(
    demandCenters[0]?.name || ''
  );
  const [selectedMetric, setSelectedMetric] = useState<'cost' | 'capacity' | 'potential'>('cost');

  const exportResults = () => {
    const csvData = hexagonData.map(hex => ({
      hexagon_id: hex.id,
      country: hex.properties.country,
      solar_potential_mw: hex.properties.theo_pv,
      wind_potential_mw: hex.properties.theo_wind,
      ocean_distance_km: hex.properties.ocean_dist,
      road_distance_km: hex.properties.road_dist,
      ...Object.keys(hex.properties)
        .filter(key => key.includes('cost') || key.includes('capacity'))
        .reduce((acc, key) => ({ ...acc, [key]: hex.properties[key] }), {})
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoh2_results_${scenarioConfig.country}_${scenarioConfig.weatherYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getResultsData = () => {
    if (!selectedDemandCenter) return [];

    return hexagonData
      .map(hex => {
        const costKey = `${selectedDemandCenter} lowest cost`;
        const pipelineCostKey = `${selectedDemandCenter} pipeline total cost`;
        const truckingCostKey = `${selectedDemandCenter} trucking total cost`;
        
        return {
          hexagon: `H${hex.id}`,
          lowestCost: hex.properties[costKey] || 0,
          pipelineCost: hex.properties[pipelineCostKey] || 0,
          truckingCost: hex.properties[truckingCostKey] || 0,
          solarPotential: hex.properties.theo_pv || 0,
          windPotential: hex.properties.theo_wind || 0,
          oceanDistance: hex.properties.ocean_dist || 0,
        };
      })
      .filter(item => item.lowestCost > 0)
      .slice(0, 50); // Limit for performance
  };

  const resultsData = getResultsData();

  const getTopPerformers = () => {
    return resultsData
      .sort((a, b) => a.lowestCost - b.lowestCost)
      .slice(0, 10);
  };

  const topPerformers = getTopPerformers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">
            Detailed results and export options for your hydrogen cost analysis.
          </p>
        </div>
        
        <button
          onClick={exportResults}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Results</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Options</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demand Center
            </label>
            <select
              value={selectedDemandCenter}
              onChange={(e) => setSelectedDemandCenter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {demandCenters.map(center => (
                <option key={center.name} value={center.name}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as 'cost' | 'capacity' | 'potential')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="cost">Cost Analysis</option>
              <option value="capacity">Capacity Analysis</option>
              <option value="potential">Renewable Potential</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Lowest Cost Hexagons</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hexagon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LCOH (€/kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solar Potential (MW)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wind Potential (MW)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ocean Distance (km)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformers.map((item, index) => (
                <tr key={item.hexagon} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.hexagon}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{item.lowestCost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.solarPotential.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.windPotential.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.oceanDistance.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Comparison Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Method Cost Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={resultsData.slice(0, 20)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hexagon" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pipelineCost" fill="#22c55e" name="Pipeline Cost (€/kg)" />
            <Bar dataKey="truckingCost" fill="#ef4444" name="Trucking Cost (€/kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Renewable Potential vs Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Solar Potential vs Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resultsData.sort((a, b) => a.solarPotential - b.solarPotential)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="solarPotential" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lowestCost" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wind Potential vs Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resultsData.sort((a, b) => a.windPotential - b.windPotential)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="windPotential" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="lowestCost" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {resultsData.length}
            </p>
            <p className="text-sm text-gray-600">Total Hexagons</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              €{resultsData.length > 0 ? (resultsData.reduce((sum, item) => sum + item.lowestCost, 0) / resultsData.length).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Average LCOH</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              {resultsData.length > 0 ? Math.min(...resultsData.map(item => item.lowestCost)).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Minimum LCOH</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-error-600">
              {resultsData.length > 0 ? Math.max(...resultsData.map(item => item.lowestCost)).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Maximum LCOH</p>
          </div>
        </div>
      </div>
    </div>
  );
};