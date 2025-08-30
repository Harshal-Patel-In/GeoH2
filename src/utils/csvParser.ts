import Papa from 'papaparse';
import { HexagonData } from '../types';

export const parseCSVToHexagons = (csvContent: string): Promise<HexagonData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const hexagons: HexagonData[] = results.data.map((row: any, index: number) => {
            // Create a simple square geometry as placeholder
            // In a real implementation, you'd need actual hexagon coordinates
            const lat = parseFloat(row.lat) || -22.5 + (Math.random() - 0.5) * 10;
            const lon = parseFloat(row.lon) || 17.0 + (Math.random() - 0.5) * 10;
            const size = 0.1;
            
            return {
              id: index,
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [lon - size, lat - size],
                  [lon + size, lat - size],
                  [lon + size, lat + size],
                  [lon - size, lat + size],
                  [lon - size, lat - size],
                ]],
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
                ...Object.keys(row).reduce((acc, key) => {
                  if (!['country', 'theo_pv', 'theo_wind', 'ocean_dist', 'road_dist', 'waterbody_dist', 'waterway_dist', 'grid_dist'].includes(key)) {
                    acc[key] = parseFloat(row[key]) || row[key];
                  }
                  return acc;
                }, {} as any),
              },
            };
          });
          
          resolve(hexagons);
        } catch (error) {
          reject(new Error('Failed to parse CSV data'));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

export const exportHexagonsToCSV = (hexagons: HexagonData[]): string => {
  const data = hexagons.map(hex => ({
    hexagon_id: hex.id,
    ...hex.properties,
  }));
  
  return Papa.unparse(data);
};