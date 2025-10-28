'use client';

import { TOPSISResult } from '@/lib/topsisTypes';

interface ResultsPanelProps {
  results: TOPSISResult[];
  onSiteClick: (siteId: string) => void;
}

export default function ResultsPanel({ results, onSiteClick }: ResultsPanelProps) {
  if (results.length === 0) {
    return null;
  }

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
              <div className="flex justify-between">
                <span className="text-gray-600">Solar Potential:</span>
                <span className="font-medium">
                  {result.criteria_scores.solar_potential.toFixed(1)} W/m²
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Land Suitability:</span>
                <span className="font-medium">
                  {result.criteria_scores.land_suitability.toFixed(1)}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grid Proximity:</span>
                <span className="font-medium">
                  {result.criteria_scores.grid_proximity.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Installation Cost:</span>
                <span className="font-medium">
                  ${result.criteria_scores.installation_cost.toFixed(0)}/kW
                </span>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Location: {result.location.lat.toFixed(4)}, {result.location.lng.toFixed(4)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
