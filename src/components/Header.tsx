import React from 'react';
import { Zap, Github, BookOpen } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GeoH2</h1>
              <p className="text-sm text-gray-600">Geospatial Hydrogen Production Cost Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/ClimateCompatibleGrowth/GeoH2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="https://doi.org/10.1016/j.mex.2024.102660"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Paper</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};