import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HexagonData, DemandCenter, ScenarioConfig } from '../types';
import { TrendingUp, Zap, MapPin, DollarSign } from 'lucide-react';

interface DashboardProps {
  hexagonData: HexagonData[];
  demandCenters: DemandCenter[];
  scenarioConfig: ScenarioConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({
  hexagonData,
  demandCenters,
  scenarioConfig,
}) => {
  // Calculate summary statistics
  const calculateStats = () => {
    if (hexagonData.length === 0 || demandCenters.length === 0) {
      return {
        avgCost: 0,
        minCost: 0,
        maxCost: 0,
        totalPotential: 0,
        avgSolarPotential: 0,
        avgWindPotential: 0,
      };
    }

    const firstDemand = demandCenters[0];
    const costKey = `${firstDemand.name} lowest cost`;
    const costs = hexagonData
      .map(h => h.properties[costKey])
      .filter(cost => cost != null && !isNaN(cost));

    const solarPotentials = hexagonData
      .map(h => h.properties.theo_pv)
      .filter(p => p != null && !isNaN(p));

    const windPotentials = hexagonData
      .map(h => h.properties.theo_wind)
      .filter(p => p != null && !isNaN(p));

    return {
      avgCost: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0,
      minCost: costs.length > 0 ? Math.min(...costs) : 0,
      maxCost: costs.length > 0 ? Math.max(...costs) : 0,
      totalPotential: solarPotentials.reduce((a, b) => a + b, 0) + windPotentials.reduce((a, b) => a + b, 0),
      avgSolarPotential: solarPotentials.length > 0 ? solarPotentials.reduce((a, b) => a + b, 0) / solarPotentials.length : 0,
      avgWindPotential: windPotentials.length > 0 ? windPotentials.reduce((a, b) => a + b, 0) / windPotentials.length : 0,
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const costDistributionData = hexagonData
    .map(h => {
      const firstDemand = demandCenters[0];
      if (!firstDemand) return null;
      const cost = h.properties[`${firstDemand.name} lowest cost`];
      return cost != null && !isNaN(cost) ? { cost: parseFloat(cost.toFixed(2)) } : null;
    })
    .filter(Boolean)
    .reduce((acc: any[], item: any) => {
      const range = Math.floor(item.cost / 0.5) * 0.5;
      const existing = acc.find(a => a.range === range);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ range: `€${range.toFixed(1)}-${(range + 0.5).toFixed(1)}`, count: 1 });
      }
      return acc;
    }, []);

  const potentialData = hexagonData.slice(0, 20).map((h, i) => ({
    hexagon: `H${h.id}`,
    solar: h.properties.theo_pv || 0,
    wind: h.properties.theo_wind || 0,
  }));

  const transportComparisonData = demandCenters.map(center => {
    const pipelineCosts = hexagonData
      .map(h => h.properties[`${center.name} pipeline total cost`])
      .filter(cost => cost != null && !isNaN(cost));
    
    const truckingCosts = hexagonData
      .map(h => h.properties[`${center.name} trucking total cost`])
      .filter(cost => cost != null && !isNaN(cost));

    return {
      center: center.name,
      pipeline: pipelineCosts.length > 0 ? pipelineCosts.reduce((a, b) => a + b, 0) / pipelineCosts.length : 0,
      trucking: truckingCosts.length > 0 ? truckingCosts.reduce((a, b) => a + b, 0) / truckingCosts.length : 0,
    };
  });

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Dashboard</h2>
        <p className="text-gray-600">
          Comprehensive analysis of hydrogen production costs and renewable potential for {scenarioConfig.country} ({scenarioConfig.weatherYear}).
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average LCOH</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.avgCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">per kg H₂</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cost Range</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.minCost.toFixed(2)} - €{stats.maxCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">per kg H₂</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total RE Potential</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.totalPotential / 1000).toFixed(1)}</p>
              <p className="text-xs text-gray-500">GW</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Demand Centers</p>
              <p className="text-2xl font-bold text-gray-900">{demandCenters.length}</p>
              <p className="text-xs text-gray-500">locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Renewable Potential */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Renewable Potential (Sample Hexagons)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={potentialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hexagon" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="solar" stackId="a" fill="#f59e0b" name="Solar (MW)" />
              <Bar dataKey="wind" stackId="a" fill="#0ea5e9" name="Wind (MW)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transport Method Comparison */}
      {transportComparisonData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Method Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transportComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="center" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pipeline" fill="#22c55e" name="Pipeline (€/kg)" />
              <Bar dataKey="trucking" fill="#ef4444" name="Trucking (€/kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demand Centers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Centers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Annual Demand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demand State
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demandCenters.map((center, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {center.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {center.lat.toFixed(3)}°, {center.lon.toFixed(3)}°
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {center.annualDemand.toLocaleString()} kg/year
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {center.demandState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};