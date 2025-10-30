'use client';

import { useState } from 'react';
import { TOPSISResult, ComparisonData, ComparisonResult, ComparisonMetrics } from '@/lib/topsisTypes';
import { getRankChangeIcon, getRankChangeColor } from '@/lib/comparisonUtils';
import { exportComparisonData } from '@/lib/exportUtils';
import ComparisonCharts from './ComparisonCharts';

import { FuzzySiteData } from '@/lib/fuzzyTypes';
import UncertaintyVisualization from './UncertaintyVisualization';
import MethodologyExplanation from './MethodologyExplanation';

interface ResultsPanelProps {
  results: TOPSISResult[];
  comparisonData?: ComparisonData;
  fuzzySiteData?: FuzzySiteData[];
  onSiteClick: (siteId: string) => void;
}

export default function ResultsPanel({ results, comparisonData, fuzzySiteData, onSiteClick }: ResultsPanelProps) {
  const [expandedSite, setExpandedSite] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [showMethodology, setShowMethodology] = useState(false);

  if (results.length === 0 && !comparisonData) {
    return null;
  }

  // Render comparison view if comparison data is provided
  if (comparisonData) {
    const weights = {
      solar_potential: 0.4,
      land_suitability: 0.3,
      grid_proximity: 0.2,
      installation_cost: 0.1,
    };

    return (
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Comparison Results</h2>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={() => exportComparisonData(comparisonData, weights, exportFormat)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Export Results
            </button>
          </div>
        </div>
        
        <ComparisonSummary metrics={comparisonData.metrics} />
        
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          {showMethodology ? '▼' : '▶'} Why Fuzzy TOPSIS? (Click to {showMethodology ? 'hide' : 'show'} methodology)
        </button>
        
        {showMethodology && (
          <div className="mb-4">
            <MethodologyExplanation />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold mb-2 text-blue-700">Fuzzy TOPSIS</h3>
            <div className="space-y-2">
              {comparisonData.fuzzy_results.slice(0, 5).map((result) => (
                <div key={result.site_id} className="p-2 border rounded text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">#{result.rank}</span>
                    <span className="text-gray-600">{result.topsis_score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-green-700">Crisp TOPSIS</h3>
            <div className="space-y-2">
              {comparisonData.crisp_results.slice(0, 5).map((result) => (
                <div key={result.site_id} className="p-2 border rounded text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">#{result.rank}</span>
                    <span className="text-gray-600">{result.topsis_score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <ComparisonTable results={comparisonData.comparison_results} onSiteClick={onSiteClick} />
        
        <ComparisonCharts comparisonData={comparisonData} />
        
        {fuzzySiteData && fuzzySiteData.length > 0 && (
          <UncertaintyVisualization sites={fuzzySiteData} />
        )}
      </div>
    );
  }

  // Calculate averages for comparison
  const avgSolar =
    results.reduce((sum, r) => sum + r.criteria_scores.solar_potential, 0) / results.length;
  const avgLand =
    results.reduce((sum, r) => sum + r.criteria_scores.land_suitability, 0) / results.length;
  const avgGrid =
    results.reduce((sum, r) => sum + r.criteria_scores.grid_proximity, 0) / results.length;
  const avgCost =
    results.reduce((sum, r) => sum + r.criteria_scores.installation_cost, 0) / results.length;

  const bestSite = results[0]; // Rank 1

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-md max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Analysis Results</h2>

      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.site_id}
            onClick={() => onSiteClick(result.site_id)}
            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{
              borderColor: getRankColor(result.rank),
              borderWidth: result.rank === 1 ? '3px' : '2px',
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Rank #{result.rank}</span>
                {result.rank === 1 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Best Site
                  </span>
                )}
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${getViabilityStyle(
                  result.viability
                )}`}
              >
                {result.viability}
              </span>
            </div>

            <div className="mb-2">
              <div className="text-sm text-gray-600">TOPSIS Score</div>
              <div className="text-2xl font-bold" style={{ color: getRankColor(result.rank) }}>
                {result.topsis_score.toFixed(1)}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {/* Solar Potential */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Solar Potential:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {result.criteria_scores.solar_potential.toFixed(1)} W/m²
                  </span>
                  {getComparisonBadge(result.criteria_scores.solar_potential, avgSolar, true)}
                </div>
              </div>

              {/* Land Suitability */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Land Suitability:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {result.criteria_scores.land_suitability.toFixed(1)}/100
                  </span>
                  {getComparisonBadge(result.criteria_scores.land_suitability, avgLand, true)}
                </div>
              </div>

              {/* Grid Proximity */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Grid Proximity:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {result.criteria_scores.grid_proximity.toFixed(1)} km
                  </span>
                  {getComparisonBadge(result.criteria_scores.grid_proximity, avgGrid, false)}
                </div>
              </div>

              {/* Installation Cost */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Installation Cost:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    ${result.criteria_scores.installation_cost.toFixed(0)}/kW
                  </span>
                  {getComparisonBadge(result.criteria_scores.installation_cost, avgCost, false)}
                </div>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSite(expandedSite === result.site_id ? null : result.site_id);
              }}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {expandedSite === result.site_id ? '▼ Hide Details' : '▶ Why this score?'}
            </button>

            {/* Expanded Details */}
            {expandedSite === result.site_id && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-xs">
                <div className="font-semibold text-gray-700">Detailed Analysis:</div>

                {/* Solar Potential Explanation */}
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-900">☀️ Solar Potential (40% weight)</div>
                  <div className="text-gray-700 mt-1">
                    {getSolarExplanation(result.criteria_scores.solar_potential, avgSolar)}
                  </div>
                </div>

                {/* Land Suitability Explanation */}
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-900">🏞️ Land Suitability (30% weight)</div>
                  <div className="text-gray-700 mt-1">
                    {getLandExplanation(result.criteria_scores.land_suitability, avgLand)}
                  </div>
                </div>

                {/* Grid Proximity Explanation */}
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-medium text-yellow-900">⚡ Grid Proximity (20% weight)</div>
                  <div className="text-gray-700 mt-1">
                    {getGridExplanation(result.criteria_scores.grid_proximity, avgGrid)}
                  </div>
                </div>

                {/* Installation Cost Explanation */}
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-medium text-purple-900">💰 Installation Cost (10% weight)</div>
                  <div className="text-gray-700 mt-1">
                    {getCostExplanation(result.criteria_scores.installation_cost, avgCost)}
                  </div>
                </div>

                {/* Overall Explanation */}
                <div className="bg-gray-50 p-2 rounded">
                  <div className="font-medium text-gray-900">📊 Overall Ranking</div>
                  <div className="text-gray-700 mt-1">
                    {getOverallExplanation(result, bestSite)}
                  </div>
                </div>

                {/* Comparison with Best Site */}
                {result.rank > 1 && (
                  <div className="bg-orange-50 p-2 rounded">
                    <div className="font-medium text-orange-900">
                      🏆 Compared to Best Site (Rank #1)
                    </div>
                    <div className="text-gray-700 mt-1">
                      {getComparisonWithBest(result, bestSite)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
              Location: {result.location.lat.toFixed(4)}, {result.location.lng.toFixed(4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to show comparison badges
function getComparisonBadge(value: number, avg: number, higherIsBetter: boolean) {
  const diff = ((value - avg) / avg) * 100;
  const isGood = higherIsBetter ? diff > 2 : diff < -2;
  const isBad = higherIsBetter ? diff < -2 : diff > 2;

  if (isGood) {
    return <span className="text-green-600 text-xs">✓</span>;
  } else if (isBad) {
    return <span className="text-red-600 text-xs">✗</span>;
  }
  return <span className="text-gray-400 text-xs">≈</span>;
}

// Explanation functions
function getSolarExplanation(value: number, avg: number): string {
  const diff = value - avg;
  if (diff > 5) {
    return `Excellent solar irradiance! This site receives ${diff.toFixed(
      1
    )} W/m² more than average, meaning more energy production and better ROI.`;
  } else if (diff > 1) {
    return `Above average solar potential. This site gets ${diff.toFixed(
      1
    )} W/m² more sunlight than typical sites in this area.`;
  } else if (diff > -1) {
    return `Average solar potential. This site receives similar sunlight to other sites in the area.`;
  } else if (diff > -5) {
    return `Slightly below average. This site gets ${Math.abs(diff).toFixed(
      1
    )} W/m² less sunlight, which may reduce energy output.`;
  } else {
    return `Lower solar potential. This site receives ${Math.abs(diff).toFixed(
      1
    )} W/m² less sunlight than average, significantly impacting energy production.`;
  }
}

function getLandExplanation(value: number, avg: number): string {
  const diff = value - avg;
  if (value > 85) {
    return `Excellent land characteristics! Flat terrain, good access, and suitable for large-scale solar installation.`;
  } else if (value > 75) {
    return `Good land suitability. Minor terrain challenges but overall suitable for solar development.`;
  } else if (value > 65) {
    return `Acceptable land conditions. Some terrain or access limitations may increase installation complexity.`;
  } else {
    return `Challenging terrain. Steep slopes, poor access, or other factors may significantly increase costs.`;
  }
}

function getGridExplanation(value: number, avg: number): string {
  const diff = value - avg;
  if (value < 3) {
    return `Excellent grid access! Very close to existing infrastructure (${value.toFixed(
      1
    )} km), minimizing connection costs.`;
  } else if (value < 5) {
    return `Good grid proximity. Connection costs will be reasonable at ${value.toFixed(1)} km distance.`;
  } else if (value < 8) {
    return `Moderate distance to grid. Connection costs at ${value.toFixed(
      1
    )} km will be noticeable but manageable.`;
  } else {
    return `Far from grid infrastructure. ${value.toFixed(
      1
    )} km distance means significant connection costs and potential delays.`;
  }
}

function getCostExplanation(value: number, avg: number): string {
  const diff = value - avg;
  if (diff < -100) {
    return `Lower installation costs! Estimated $${Math.abs(diff).toFixed(
      0
    )}/kW below average due to favorable conditions.`;
  } else if (diff < -20) {
    return `Slightly lower costs. About $${Math.abs(diff).toFixed(0)}/kW savings compared to average.`;
  } else if (diff < 20) {
    return `Average installation costs. Standard pricing for this type of site.`;
  } else if (diff < 100) {
    return `Slightly higher costs. About $${diff.toFixed(
      0
    )}/kW more than average due to site-specific factors.`;
  } else {
    return `Higher installation costs. Estimated $${diff.toFixed(
      0
    )}/kW above average due to challenging conditions.`;
  }
}

function getOverallExplanation(result: TOPSISResult, bestSite: TOPSISResult): string {
  if (result.rank === 1) {
    return `This is the best site! It has the optimal combination of solar potential, land suitability, grid access, and cost. Score: ${result.topsis_score.toFixed(
      1
    )}/100`;
  } else if (result.rank === 2) {
    const scoreDiff = bestSite.topsis_score - result.topsis_score;
    return `Second best site. Only ${scoreDiff.toFixed(
      1
    )} points behind the top site. Still an excellent choice!`;
  } else if (result.rank <= 3) {
    return `Good site overall. Ranks in the top 3 due to balanced performance across all criteria.`;
  } else {
    return `Ranked #${result.rank} out of ${
      result.rank
    } sites. Some criteria are below average, affecting the overall score.`;
  }
}

function getComparisonWithBest(result: TOPSISResult, bestSite: TOPSISResult): string {
  const reasons: string[] = [];

  const solarDiff = bestSite.criteria_scores.solar_potential - result.criteria_scores.solar_potential;
  if (solarDiff > 2) {
    reasons.push(`${solarDiff.toFixed(1)} W/m² less solar potential`);
  }

  const landDiff = bestSite.criteria_scores.land_suitability - result.criteria_scores.land_suitability;
  if (landDiff > 3) {
    reasons.push(`${landDiff.toFixed(1)} points lower land suitability`);
  }

  const gridDiff = result.criteria_scores.grid_proximity - bestSite.criteria_scores.grid_proximity;
  if (gridDiff > 1) {
    reasons.push(`${gridDiff.toFixed(1)} km farther from grid`);
  }

  const costDiff = result.criteria_scores.installation_cost - bestSite.criteria_scores.installation_cost;
  if (costDiff > 50) {
    reasons.push(`$${costDiff.toFixed(0)}/kW higher installation cost`);
  }

  if (reasons.length === 0) {
    return 'Very similar to the best site! Small differences in multiple criteria add up.';
  }

  return `Main differences: ${reasons.join(', ')}.`;
}


function getRankColor(rank: number): string {
  if (rank === 1) return '#22c55e'; // Green
  if (rank === 2) return '#84cc16'; // Light green
  if (rank === 3) return '#eab308'; // Yellow
  if (rank <= 5) return '#f97316'; // Orange
  return '#ef4444'; // Red
}

function getViabilityStyle(viability: string): string {
  switch (viability) {
    case 'Excellent':
      return 'bg-green-100 text-green-800';
    case 'Good':
      return 'bg-blue-100 text-blue-800';
    case 'Fair':
      return 'bg-yellow-100 text-yellow-800';
    case 'Poor':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Comparison Summary Component
function ComparisonSummary({ metrics }: { metrics: ComparisonMetrics }) {
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2">Comparison Summary</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-600">Sites with rank changes:</span>
          <span className="ml-2 font-semibold">{metrics.sites_with_rank_changes}</span>
        </div>
        <div>
          <span className="text-gray-600">Max rank difference:</span>
          <span className="ml-2 font-semibold">{metrics.max_rank_difference}</span>
        </div>
        <div>
          <span className="text-gray-600">Avg score difference:</span>
          <span className="ml-2 font-semibold">{metrics.average_score_difference.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Rank correlation:</span>
          <span className="ml-2 font-semibold">{metrics.rank_correlation.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

// Comparison Table Component
function ComparisonTable({ results, onSiteClick }: { results: ComparisonResult[]; onSiteClick: (siteId: string) => void }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Detailed Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Site</th>
              <th className="p-2 text-center">Fuzzy Rank</th>
              <th className="p-2 text-center">Crisp Rank</th>
              <th className="p-2 text-center">Change</th>
              <th className="p-2 text-right">Fuzzy Score</th>
              <th className="p-2 text-right">Crisp Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr 
                key={result.site_id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => onSiteClick(result.site_id)}
              >
                <td className="p-2">{result.site_id}</td>
                <td className="p-2 text-center">#{result.fuzzy_rank}</td>
                <td className="p-2 text-center">#{result.crisp_rank}</td>
                <td className={`p-2 text-center font-semibold ${getRankChangeColor(result.rank_change)}`}>
                  {getRankChangeIcon(result.rank_change)} {Math.abs(result.rank_change)}
                </td>
                <td className="p-2 text-right">{result.fuzzy_score.toFixed(1)}</td>
                <td className="p-2 text-right">{result.crisp_score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
