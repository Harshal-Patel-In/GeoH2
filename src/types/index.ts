export interface HexagonData {
  id: number;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    country: string;
    waterbody_dist: number;
    waterway_dist: number;
    ocean_dist: number;
    grid_dist: number;
    road_dist: number;
    theo_pv: number;
    theo_wind: number;
    // Cost data for different demand centers and transport methods
    [key: string]: any;
  };
}

export interface DemandCenter {
  name: string;
  lat: number;
  lon: number;
  annualDemand: number; // kg/year
  demandState: '500 bar' | 'LH2' | 'NH3';
}

export interface ScenarioConfig {
  country: string;
  weatherYear: number;
  generators: string[];
  transport: {
    pipelineConstruction: boolean;
    roadConstruction: boolean;
  };
}

export interface CostBreakdown {
  production: number;
  transport: number;
  conversion: number;
  storage: number;
  total: number;
}

export interface OptimizationResult {
  hexagonId: number;
  demandCenter: string;
  transportMethod: 'pipeline' | 'trucking';
  lcoh: number; // €/kg
  costBreakdown: CostBreakdown;
  capacities: {
    wind: number; // MW
    solar: number; // MW
    electrolyzer: number; // MW
    battery: number; // MW
    h2Storage: number; // MWh
  };
}