// TOPSIS result type definitions

export interface TOPSISResult {
  site_id: string;
  rank: number;
  topsis_score: number; // 0-100 (closeness coefficient * 100)
  viability: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  criteria_scores: {
    solar_potential: number;
    land_suitability: number;
    grid_proximity: number;
    installation_cost: number;
  };
  location: {
    lat: number;
    lng: number;
  };
}

export interface CriteriaWeights {
  solar_potential: number;
  land_suitability: number;
  grid_proximity: number;
  installation_cost: number;
}
