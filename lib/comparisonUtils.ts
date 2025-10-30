import { TOPSISResult, ComparisonResult, ComparisonMetrics, ComparisonData } from './topsisTypes';

/**
 * Calculate comparison metrics between fuzzy and crisp TOPSIS results
 */
export function calculateComparisonMetrics(
  fuzzyResults: TOPSISResult[],
  crispResults: TOPSISResult[]
): ComparisonData {
  const comparisonResults: ComparisonResult[] = [];

  // Create comparison for each site
  fuzzyResults.forEach((fuzzyResult) => {
    const crispResult = crispResults.find((r) => r.site_id === fuzzyResult.site_id);
    if (!crispResult) return;

    const rankChange = fuzzyResult.rank - crispResult.rank;
    const scoreDiff = crispResult.topsis_score - fuzzyResult.topsis_score;

    comparisonResults.push({
      site_id: fuzzyResult.site_id,
      fuzzy_rank: fuzzyResult.rank,
      crisp_rank: crispResult.rank,
      rank_change: rankChange,
      fuzzy_score: fuzzyResult.topsis_score,
      crisp_score: crispResult.topsis_score,
      score_difference: scoreDiff,
      location: fuzzyResult.location,
      criteria_scores: fuzzyResult.criteria_scores,
    });
  });

  // Calculate sites with rank changes
  const sitesWithRankChanges = comparisonResults.filter((r) => r.rank_change !== 0).length;

  // Calculate max rank difference
  const maxRankDifference = Math.max(...comparisonResults.map((r) => Math.abs(r.rank_change)));

  // Calculate average score difference
  const avgScoreDifference =
    comparisonResults.reduce((sum, r) => sum + Math.abs(r.score_difference), 0) /
    comparisonResults.length;

  // Calculate Spearman's rank correlation
  const rankCorrelation = calculateSpearmanCorrelation(
    comparisonResults.map((r) => r.fuzzy_rank),
    comparisonResults.map((r) => r.crisp_rank)
  );

  const metrics: ComparisonMetrics = {
    sites_with_rank_changes: sitesWithRankChanges,
    max_rank_difference: maxRankDifference,
    average_score_difference: avgScoreDifference,
    rank_correlation: rankCorrelation,
  };

  return {
    fuzzy_results: fuzzyResults,
    crisp_results: crispResults,
    comparison_results: comparisonResults,
    metrics,
  };
}

/**
 * Calculate Spearman's rank correlation coefficient
 */
function calculateSpearmanCorrelation(ranks1: number[], ranks2: number[]): number {
  const n = ranks1.length;
  if (n === 0) return 0;

  let sumD2 = 0;
  for (let i = 0; i < n; i++) {
    const d = ranks1[i] - ranks2[i];
    sumD2 += d * d;
  }

  return 1 - (6 * sumD2) / (n * (n * n - 1));
}

/**
 * Get icon for rank change visualization
 */
export function getRankChangeIcon(rankChange: number): string {
  if (rankChange > 0) return '↑'; // Improved in crisp
  if (rankChange < 0) return '↓'; // Worse in crisp
  return '='; // No change
}

/**
 * Get color class for rank change visualization
 */
export function getRankChangeColor(rankChange: number): string {
  if (rankChange > 0) return 'text-green-600';
  if (rankChange < 0) return 'text-red-600';
  return 'text-gray-400';
}
