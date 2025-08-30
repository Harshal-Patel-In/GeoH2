import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { HexagonData, DemandCenter } from '../types';
import Papa from 'papaparse';

interface DataUploadProps {
  onDataUpload: (data: { hexagons: HexagonData[], demands: DemandCenter[] }) => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onDataUpload }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
          // Handle GeoJSON files
          const geoData = JSON.parse(content);
          if (geoData.features) {
            const hexagons: HexagonData[] = geoData.features.map((feature: any, index: number) => ({
              id: index,
              geometry: feature.geometry,
              properties: feature.properties,
            }));
            
            // Create sample demand centers based on the data
            const sampleDemands: DemandCenter[] = [
              {
                name: 'Windhoek',
                lat: -22.5609,
                lon: 17.0658,
                annualDemand: 1000000,
                demandState: '500 bar' as const,
              }
            ];
            
            onDataUpload({ hexagons, demands: sampleDemands });
            setUploadStatus('success');
          }
        } else if (file.name.endsWith('.csv')) {
          // Handle CSV files
          Papa.parse(content, {
            header: true,
            complete: (results) => {
              try {
                // Process CSV data - this is a simplified example
                const hexagons: HexagonData[] = results.data.slice(0, 100).map((row: any, index: number) => ({
                  id: index,
                  geometry: {
                    type: 'Polygon',
                    coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]], // Placeholder geometry
                  },
                  properties: {
                    country: row.country || 'NA',
                    theo_pv: parseFloat(row.theo_pv) || 0,
                    theo_wind: parseFloat(row.theo_wind) || 0,
                    ocean_dist: parseFloat(row.ocean_dist) || 0,
                    road_dist: parseFloat(row.road_dist) || 0,
                    waterbody_dist: parseFloat(row.waterbody_dist) || 0,
                    waterway_dist: parseFloat(row.waterway_dist) || 0,
                    grid_dist: parseFloat(row.grid_dist) || 0,
                  },
                }));

                const sampleDemands: DemandCenter[] = [
                  {
                    name: 'Sample Demand',
                    lat: -22.5,
                    lon: 17.0,
                    annualDemand: 1000000,
                    demandState: '500 bar' as const,
                  }
                ];

                onDataUpload({ hexagons, demands: sampleDemands });
                setUploadStatus('success');
              } catch (error) {
                setErrorMessage('Failed to parse CSV data. Please check the format.');
                setUploadStatus('error');
              }
            },
            error: (error) => {
              setErrorMessage(`CSV parsing error: ${error.message}`);
              setUploadStatus('error');
            }
          });
        } else {
          setErrorMessage('Unsupported file format. Please upload GeoJSON or CSV files.');
          setUploadStatus('error');
        }
      } catch (error) {
        setErrorMessage('Failed to read file. Please check the file format.');
        setUploadStatus('error');
      }
    };

    reader.onerror = () => {
      setErrorMessage('Failed to read file.');
      setUploadStatus('error');
    };

    reader.readAsText(file);
  }, [onDataUpload]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Upload</h2>
        <p className="text-gray-600">
          Upload your hexagon data files to analyze hydrogen production costs in your region of interest.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Hexagon Data</h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your GeoJSON or CSV file here, or click to browse.
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              accept=".geojson,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={uploadStatus === 'uploading'}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Choose File'}
            </label>
          </div>

          {uploadStatus === 'success' && (
            <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                <p className="text-success-800">File uploaded successfully!</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-error-600 mr-2" />
                <p className="text-error-800">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Data Format</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Hexagon GeoJSON Properties</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code className="bg-gray-100 px-1 rounded">country</code>: Country code (e.g., "NA")</li>
              <li>• <code className="bg-gray-100 px-1 rounded">theo_pv</code>: Theoretical PV potential (MW)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">theo_wind</code>: Theoretical wind potential (MW)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">ocean_dist</code>: Distance to ocean (km)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">road_dist</code>: Distance to roads (km)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">waterbody_dist</code>: Distance to water bodies (km)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">waterway_dist</code>: Distance to waterways (km)</li>
              <li>• <code className="bg-gray-100 px-1 rounded">grid_dist</code>: Distance to grid (km)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600">
              CSV files should contain the same properties as columns, with one hexagon per row.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};