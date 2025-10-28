// Fuzzy number type definitions

export interface FuzzyNumber {
  lower: number; // Pessimistic scenario
  most_likely: number; // Expected scenario
  upper: number; // Optimistic scenario
}

export interface FuzzyCriteria {
  solar_potential: FuzzyNumber; // GHI in W/m²
  land_suitability: FuzzyNumber; // 0-100 score
  grid_proximity: FuzzyNumber; // Distance in km (lower is better)
  installation_cost: FuzzyNumber; // $/kW (lower is better)
}

export interface FuzzySiteData {
  site_id: string;
  location: {
    lat: number;
    lng: number;
  };
  criteria: FuzzyCriteria;
  metadata: {
    historical_years: number;
    current_year_days: number;
    confidence: number; // 0-1
  };
}
