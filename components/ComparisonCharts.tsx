'use client';

import { ComparisonData } from '@/lib/topsisTypes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';

interface ComparisonChartsProps {
  comparisonData: ComparisonData;
}

export default function ComparisonCharts({ comparisonData }: ComparisonChartsProps) {
  // Prepare data for ranking comparison
  const rankingData = comparisonData.comparison_results.map((result) => ({
    site: result.site_id,
    'Fuzzy Rank': result.fuzzy_rank,
    'Crisp Rank': result.crisp_rank,
  }));

  // Prepare data for score comparison
  const scoreData = comparisonData.comparison_results.map((result) => ({
    site: result.site_id,
    'Fuzzy Score': result.fuzzy_score,
    'Crisp Score': result.crisp_score,
  }));

  // Prepare data for rank change visualization
  const rankChangeData = comparisonData.comparison_results
    .map((result) => ({
      site: result.site_id,
      change: result.rank_change,
      absChange: Math.abs(result.rank_change),
    }))
    .sort((a, b) => b.absChange - a.absChange);

  // Prepare data for criteria comparison (average across all sites)
  const criteriaData = [
    {
      criterion: 'Solar Potential',
      value:
        comparisonData.comparison_results.reduce(
          (sum, r) => sum + r.criteria_scores.solar_potential,
          0
        ) / comparisonData.comparison_results.length,
    },
    {
      criterion: 'Land Suitability',
      value:
        comparisonData.comparison_results.reduce(
          (sum, r) => sum + r.criteria_scores.land_suitability,
          0
        ) / comparisonData.comparison_results.length,
    },
    {
      criterion: 'Grid Proximity',
      value:
        comparisonData.comparison_results.reduce(
          (sum, r) => sum + r.criteria_scores.grid_proximity,
          0
        ) / comparisonData.comparison_results.length,
    },
    {
      criterion: 'Installation Cost',
      value:
        comparisonData.comparison_results.reduce(
          (sum, r) => sum + r.criteria_scores.installation_cost,
          0
        ) / comparisonData.comparison_results.length,
    },
  ];

  // Prepare scatter plot data (Fuzzy vs Crisp scores)
  const scatterData = comparisonData.comparison_results.map((result) => ({
    fuzzy: result.fuzzy_score,
    crisp: result.crisp_score,
    site: result.site_id,
  }));

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Visual Analysis</h3>

      {/* Ranking Comparison */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">Ranking Comparison</h4>
        <p className="text-xs text-gray-500 mb-3">
          Lower rank number = better site. Notice the complete reversal pattern.
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rankingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis reversed domain={[1, 4]} label={{ value: 'Rank', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Fuzzy Rank" fill="#3b82f6" />
            <Bar dataKey="Crisp Rank" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Score Comparison */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">TOPSIS Score Comparison</h4>
        <p className="text-xs text-gray-500 mb-3">
          Scores range from 0-100. Higher = better. Note the dramatic differences.
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Fuzzy Score" fill="#3b82f6" />
            <Bar dataKey="Crisp Score" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rank Change Visualization */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">Rank Changes</h4>
        <p className="text-xs text-gray-500 mb-3">
          Positive = improved in crisp, Negative = declined in crisp
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={rankChangeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[-4, 4]} />
            <YAxis type="category" dataKey="site" />
            <Tooltip />
            <Bar dataKey="change">
              {rankChangeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.change > 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Fuzzy vs Crisp Scatter Plot */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">Fuzzy vs Crisp Score Correlation</h4>
        <p className="text-xs text-gray-500 mb-3">
          Perfect correlation would follow the diagonal line. Deviation shows disagreement.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="fuzzy"
              name="Fuzzy Score"
              domain={[0, 100]}
              label={{ value: 'Fuzzy TOPSIS Score', position: 'bottom' }}
            />
            <YAxis
              type="number"
              dataKey="crisp"
              name="Crisp Score"
              domain={[0, 100]}
              label={{ value: 'Crisp TOPSIS Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Sites" data={scatterData} fill="#8b5cf6">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#8b5cf6" />
              ))}
            </Scatter>
            {/* Reference line for perfect correlation */}
            <Line
              type="linear"
              dataKey="crisp"
              data={[
                { fuzzy: 0, crisp: 0 },
                { fuzzy: 100, crisp: 100 },
              ]}
              stroke="#94a3b8"
              strokeDasharray="5 5"
              dot={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Average Criteria Values */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">Average Criteria Values</h4>
        <p className="text-xs text-gray-500 mb-3">
          Mean values across all sites (using most_likely from fuzzy numbers)
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={criteriaData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="criterion" />
            <PolarRadiusAxis />
            <Radar name="Average Value" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold mb-2 text-gray-800">📊 Key Insights</h4>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>
            <strong>Rank Correlation: {comparisonData.metrics.rank_correlation.toFixed(3)}</strong>
            {comparisonData.metrics.rank_correlation < -0.5 && (
              <span className="text-red-600 ml-2">
                ⚠️ Strong negative correlation - rankings are reversed!
              </span>
            )}
          </li>
          <li>
            <strong>Sites with rank changes:</strong> {comparisonData.metrics.sites_with_rank_changes} out of{' '}
            {comparisonData.comparison_results.length}
          </li>
          <li>
            <strong>Average score difference:</strong> {comparisonData.metrics.average_score_difference.toFixed(1)}{' '}
            points
            {comparisonData.metrics.average_score_difference > 50 && (
              <span className="text-orange-600 ml-2">⚠️ Very high disagreement between methods</span>
            )}
          </li>
          <li className="pt-2 border-t border-blue-200 mt-2">
            <strong>Interpretation:</strong> The negative correlation indicates that fuzzy TOPSIS (which accounts
            for uncertainty) produces significantly different rankings than crisp TOPSIS (which uses only expected
            values). This suggests high data uncertainty and demonstrates why fuzzy logic is valuable for this
            decision.
          </li>
        </ul>
      </div>
    </div>
  );
}
