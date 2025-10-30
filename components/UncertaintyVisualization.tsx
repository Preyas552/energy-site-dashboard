'use client';

import { FuzzySiteData } from '@/lib/fuzzyTypes';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ErrorBar,
} from 'recharts';

interface UncertaintyVisualizationProps {
  sites: FuzzySiteData[];
}

export default function UncertaintyVisualization({ sites }: UncertaintyVisualizationProps) {
  // Prepare data showing uncertainty ranges for each criterion
  const solarData = sites.map((site) => ({
    site: site.site_id,
    value: site.criteria.solar_potential.most_likely,
    lower: site.criteria.solar_potential.most_likely - site.criteria.solar_potential.lower,
    upper: site.criteria.solar_potential.upper - site.criteria.solar_potential.most_likely,
    range: site.criteria.solar_potential.upper - site.criteria.solar_potential.lower,
  }));

  const landData = sites.map((site) => ({
    site: site.site_id,
    value: site.criteria.land_suitability.most_likely,
    lower: site.criteria.land_suitability.most_likely - site.criteria.land_suitability.lower,
    upper: site.criteria.land_suitability.upper - site.criteria.land_suitability.most_likely,
    range: site.criteria.land_suitability.upper - site.criteria.land_suitability.lower,
  }));

  const gridData = sites.map((site) => ({
    site: site.site_id,
    value: site.criteria.grid_proximity.most_likely,
    lower: site.criteria.grid_proximity.most_likely - site.criteria.grid_proximity.lower,
    upper: site.criteria.grid_proximity.upper - site.criteria.grid_proximity.most_likely,
    range: site.criteria.grid_proximity.upper - site.criteria.grid_proximity.lower,
  }));

  const costData = sites.map((site) => ({
    site: site.site_id,
    value: site.criteria.installation_cost.most_likely,
    lower: site.criteria.installation_cost.most_likely - site.criteria.installation_cost.lower,
    upper: site.criteria.installation_cost.upper - site.criteria.installation_cost.most_likely,
    range: site.criteria.installation_cost.upper - site.criteria.installation_cost.lower,
  }));

  // Calculate average uncertainty for each criterion
  const avgSolarUncertainty =
    solarData.reduce((sum, d) => sum + d.range, 0) / solarData.length;
  const avgLandUncertainty =
    landData.reduce((sum, d) => sum + d.range, 0) / landData.length;
  const avgGridUncertainty =
    gridData.reduce((sum, d) => sum + d.range, 0) / gridData.length;
  const avgCostUncertainty =
    costData.reduce((sum, d) => sum + d.range, 0) / costData.length;

  const uncertaintySummary = [
    { criterion: 'Solar Potential', uncertainty: avgSolarUncertainty },
    { criterion: 'Land Suitability', uncertainty: avgLandUncertainty },
    { criterion: 'Grid Proximity', uncertainty: avgGridUncertainty },
    { criterion: 'Installation Cost', uncertainty: avgCostUncertainty },
  ];

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-800">Uncertainty Analysis</h3>
      <p className="text-sm text-gray-600">
        Fuzzy numbers represent uncertainty ranges: <strong>pessimistic (lower)</strong>,{' '}
        <strong>expected (most likely)</strong>, and <strong>optimistic (upper)</strong> scenarios.
      </p>

      {/* Solar Potential Uncertainty */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">☀️ Solar Potential Uncertainty</h4>
        <p className="text-xs text-gray-500 mb-3">
          Based on historical mean ± standard deviation from NASA data
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={solarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis label={{ value: 'W/m²', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#f59e0b">
              <ErrorBar dataKey="lower" width={4} strokeWidth={2} stroke="#f59e0b" direction="y" />
              <ErrorBar dataKey="upper" width={4} strokeWidth={2} stroke="#f59e0b" direction="y" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Land Suitability Uncertainty */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">🏞️ Land Suitability Uncertainty</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={landData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis domain={[0, 100]} label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#10b981">
              <ErrorBar dataKey="lower" width={4} strokeWidth={2} stroke="#10b981" direction="y" />
              <ErrorBar dataKey="upper" width={4} strokeWidth={2} stroke="#10b981" direction="y" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid Proximity Uncertainty */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">⚡ Grid Proximity Uncertainty</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={gridData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6">
              <ErrorBar dataKey="lower" width={4} strokeWidth={2} stroke="#3b82f6" direction="y" />
              <ErrorBar dataKey="upper" width={4} strokeWidth={2} stroke="#3b82f6" direction="y" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Installation Cost Uncertainty */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">💰 Installation Cost Uncertainty</h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="site" />
            <YAxis label={{ value: '$/kW', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6">
              <ErrorBar dataKey="lower" width={4} strokeWidth={2} stroke="#8b5cf6" direction="y" />
              <ErrorBar dataKey="upper" width={4} strokeWidth={2} stroke="#8b5cf6" direction="y" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Uncertainty Summary */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-3 text-gray-700">Average Uncertainty by Criterion</h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={uncertaintySummary} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Uncertainty Range', position: 'bottom' }} />
            <YAxis type="category" dataKey="criterion" width={150} />
            <Tooltip />
            <Bar dataKey="uncertainty" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">🎯 Why This Matters</h4>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>
            <strong>Error bars show uncertainty ranges:</strong> Wider bars = more uncertainty in the data
          </li>
          <li>
            <strong>Fuzzy TOPSIS uses the full range:</strong> It considers pessimistic, expected, and optimistic
            scenarios
          </li>
          <li>
            <strong>Crisp TOPSIS uses only the center point:</strong> It ignores the uncertainty, potentially
            missing important information
          </li>
          <li>
            <strong>Sites with high uncertainty:</strong> May rank differently depending on which method you use
          </li>
          <li className="pt-2 border-t border-purple-200 mt-2">
            <strong>Statistical Foundation:</strong> Our fuzzy numbers are derived from NASA historical data using
            mean ± standard deviation, providing a scientifically grounded representation of real-world variability.
          </li>
        </ul>
      </div>
    </div>
  );
}
