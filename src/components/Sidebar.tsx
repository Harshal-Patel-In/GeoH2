import React from 'react';
import { Map, BarChart3, Upload, FileText, Settings } from 'lucide-react';
import { ScenarioConfig } from '../types';

interface SidebarProps {
  activeView: 'map' | 'dashboard' | 'upload' | 'results';
  onViewChange: (view: 'map' | 'dashboard' | 'upload' | 'results') => void;
  scenarioConfig: ScenarioConfig;
  onScenarioChange: (config: ScenarioConfig) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  scenarioConfig,
  onScenarioChange,
}) => {
  const menuItems = [
    { id: 'map' as const, label: 'Map View', icon: Map },
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'upload' as const, label: 'Data Upload', icon: Upload },
    { id: 'results' as const, label: 'Results', icon: FileText },
  ];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Scenario Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={scenarioConfig.country}
                onChange={(e) => onScenarioChange({ ...scenarioConfig, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="NA">Namibia</option>
                <option value="ZA">South Africa</option>
                <option value="AU">Australia</option>
                <option value="CL">Chile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weather Year
              </label>
              <select
                value={scenarioConfig.weatherYear}
                onChange={(e) => onScenarioChange({ ...scenarioConfig, weatherYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {Array.from({ length: 10 }, (_, i) => 2023 - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generators
              </label>
              <div className="space-y-2">
                {['Solar', 'Wind'].map(generator => (
                  <label key={generator} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scenarioConfig.generators.includes(generator)}
                      onChange={(e) => {
                        const newGenerators = e.target.checked
                          ? [...scenarioConfig.generators, generator]
                          : scenarioConfig.generators.filter(g => g !== generator);
                        onScenarioChange({ ...scenarioConfig, generators: newGenerators });
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{generator}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transport Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scenarioConfig.transport.pipelineConstruction}
                    onChange={(e) => onScenarioChange({
                      ...scenarioConfig,
                      transport: { ...scenarioConfig.transport, pipelineConstruction: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pipeline Construction</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scenarioConfig.transport.roadConstruction}
                    onChange={(e) => onScenarioChange({
                      ...scenarioConfig,
                      transport: { ...scenarioConfig.transport, roadConstruction: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Road Construction</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};