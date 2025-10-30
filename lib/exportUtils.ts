import { ComparisonData, CriteriaWeights } from './topsisTypes';

/**
 * Export comparison data in JSON or CSV format
 */
export function exportComparisonData(
  comparisonData: ComparisonData,
  weights: CriteriaWeights,
  format: 'json' | 'csv'
): void {
  if (format === 'json') {
    exportAsJSON(comparisonData, weights);
  } else {
    exportAsCSV(comparisonData, weights);
  }
}

/**
 * Export comparison data as JSON
 */
function exportAsJSON(comparisonData: ComparisonData, weights: CriteriaWeights): void {
  const exportData = {
    timestamp: new Date().toISOString(),
    analysis_type: 'comparison',
    parameters: {
      weights,
    },
    metrics: comparisonData.metrics,
    results: comparisonData.comparison_results,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `topsis-comparison-${Date.now()}.json`);
}

/**
 * Export comparison data as CSV
 */
function exportAsCSV(comparisonData: ComparisonData, weights: CriteriaWeights): void {
  const csv = convertToCSV(comparisonData);
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `topsis-comparison-${Date.now()}.csv`);
}

/**
 * Convert comparison results to CSV format
 */
function convertToCSV(comparisonData: ComparisonData): string {
  const headers = [
    'Site ID',
    'Fuzzy Rank',
    'Crisp Rank',
    'Rank Change',
    'Fuzzy Score',
    'Crisp Score',
    'Score Difference',
    'Latitude',
    'Longitude',
    'Solar Potential',
    'Land Suitability',
    'Grid Proximity',
    'Installation Cost',
  ];

  const rows = comparisonData.comparison_results.map((result) => [
    result.site_id,
    result.fuzzy_rank,
    result.crisp_rank,
    result.rank_change,
    result.fuzzy_score.toFixed(2),
    result.crisp_score.toFixed(2),
    result.score_difference.toFixed(2),
    result.location.lat.toFixed(6),
    result.location.lng.toFixed(6),
    result.criteria_scores.solar_potential.toFixed(2),
    result.criteria_scores.land_suitability.toFixed(2),
    result.criteria_scores.grid_proximity.toFixed(2),
    result.criteria_scores.installation_cost.toFixed(2),
  ]);

  // Add metrics as header rows
  const metricsRows = [
    ['Comparison Metrics'],
    ['Sites with Rank Changes', comparisonData.metrics.sites_with_rank_changes],
    ['Max Rank Difference', comparisonData.metrics.max_rank_difference],
    ['Average Score Difference', comparisonData.metrics.average_score_difference.toFixed(2)],
    ['Rank Correlation', comparisonData.metrics.rank_correlation.toFixed(3)],
    [], // Empty row separator
  ];

  const csvContent = [
    ...metricsRows.map((row) => row.join(',')),
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Trigger browser download of a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
