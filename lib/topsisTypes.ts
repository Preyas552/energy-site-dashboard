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

// Comparison type definitions

export interface ComparisonMetrics {
  sites_with_rank_changes: number;
  max_rank_difference: number;
  average_score_difference: number;
  rank_correlation: number;
}

export interface ComparisonResult {
  site_id: string;
  fuzzy_rank: number;
  crisp_rank: number;
  rank_change: number; // positive = improved in crisp, negative = worse in crisp
  fuzzy_score: number;
  crisp_score: number;
  score_difference: number;
  location: { lat: number; lng: number };
  criteria_scores: {
    solar_potential: number;
    land_suitability: number;
    grid_proximity: number;
    installation_cost: number;
  };
}

export interface ComparisonData {
  fuzzy_results: TOPSISResult[];
  crisp_results: TOPSISResult[];
  comparison_results: ComparisonResult[];
  metrics: ComparisonMetrics;
}
