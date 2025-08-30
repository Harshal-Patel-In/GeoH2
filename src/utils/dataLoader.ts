import { HexagonData, DemandCenter } from '../types';

// Generate sample hexagon data for demonstration
export const generateSampleHexagons = (count: number = 100): HexagonData[] => {
  const hexagons: HexagonData[] = [];
  
  // Namibia bounds approximately
  const minLat = -28.0;
  const maxLat = -17.0;
  const minLon = 11.0;
  const maxLon = 25.0;
  
  for (let i = 0; i < count; i++) {
    const centerLat = minLat + Math.random() * (maxLat - minLat);
    const centerLon = minLon + Math.random() * (maxLon - minLon);
    
    // Create a simple hexagon around the center point
    const size = 0.5; // degrees
    const coordinates = [
      [
        [centerLon - size, centerLat - size],
        [centerLon + size, centerLat - size],
        [centerLon + size, centerLat + size],
        [centerLon - size, centerLat + size],
        [centerLon - size, centerLat - size],
      ]
    ];

    // Generate realistic sample data
    const solarPotential = Math.random() * 1000 + 200; // 200-1200 MW
    const windPotential = Math.random() * 800 + 100; // 100-900 MW
    const oceanDist = Math.random() * 500 + 10; // 10-510 km
    const roadDist = Math.random() * 50; // 0-50 km
    
    // Calculate sample costs based on potential and distance
    const baseCost = 2.0 + (oceanDist / 100) + (roadDist / 10) - (solarPotential + windPotential) / 1000;
    const pipelineCost = baseCost * (0.8 + Math.random() * 0.4);
    const truckingCost = baseCost * (1.0 + Math.random() * 0.5);
    const lowestCost = Math.min(pipelineCost, truckingCost);

    hexagons.push({
      id: i,
      geometry: {
        type: 'Polygon',
        coordinates,
      },
      properties: {
        country: 'NA',
        theo_pv: solarPotential,
        theo_wind: windPotential,
        ocean_dist: oceanDist,
        road_dist: roadDist,
        waterbody_dist: Math.random() * 100,
        waterway_dist: Math.random() * 80,
        grid_dist: Math.random() * 200,
        'Windhoek lowest cost': lowestCost,
        'Windhoek pipeline total cost': pipelineCost,
        'Windhoek trucking total cost': truckingCost,
        'Windhoek pipeline production cost': baseCost * 0.6,
        'Windhoek trucking production cost': baseCost * 0.6,
        'Windhoek pipeline transport and conversion costs': pipelineCost - baseCost * 0.6,
        'Windhoek trucking transport and conversion costs': truckingCost - baseCost * 0.6,
      },
    });
  }
  
  return hexagons;
};

export const generateSampleDemandCenters = (): DemandCenter[] => {
  return [
    {
      name: 'Windhoek',
      lat: -22.5609,
      lon: 17.0658,
      annualDemand: 1000000, // 1,000 tonnes per year
      demandState: '500 bar',
    },
    {
      name: 'Walvis Bay',
      lat: -22.9576,
      lon: 14.5052,
      annualDemand: 2000000, // 2,000 tonnes per year
      demandState: 'LH2',
    },
    {
      name: 'Lüderitz',
      lat: -26.6484,
      lon: 15.1594,
      annualDemand: 500000, // 500 tonnes per year
      demandState: 'NH3',
    },
  ];
};

export const loadSampleData = async (): Promise<{ hexagons: HexagonData[], demands: DemandCenter[] }> => {
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    hexagons: generateSampleHexagons(),
    demands: generateSampleDemandCenters(),
  };
};