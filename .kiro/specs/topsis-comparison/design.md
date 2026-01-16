# Design Document: TOPSIS Comparison Feature

## Overview

This feature adds the capability to compare fuzzy TOPSIS and crisp TOPSIS analysis results side-by-side. Users can toggle comparison mode to see how uncertainty modeling (fuzzy logic) affects site rankings compared to traditional deterministic analysis (crisp values). The comparison will be displayed in the existing ResultsPanel component with enhanced UI to show both methods simultaneously.

## Architecture

### High-Level Flow

```
User enables comparison mode
    ↓
Frontend extracts most_likely values from fuzzy data
    ↓
Frontend makes parallel API calls:
    - /api/topsis (fuzzy TOPSIS)
    - /api/topsis/crisp (new crisp TOPSIS endpoint)
    ↓
Both services process and return rankings
    ↓
Frontend calculates comparison metrics
    ↓
ResultsPanel displays side-by-side comparison
```

### Component Architecture

```
MapContainer (parent)
    ├── ControlPanel (add comparison toggle)
    ├── ResultsPanel (enhanced for comparison view)
    └── GridLayer
```

## Components and Interfaces

### 1. Backend: Crisp TOPSIS Implementation

**File:** `topsis-service/app.py`

Add a new `CrispTOPSIS` class alongside the existing `FuzzyTOPSIS` class:

```python
class CrispTOPSIS:
    """Traditional TOPSIS implementation using deterministic values"""
    
    def __init__(self, alternatives, weights, criteria_types):
        """
        alternatives: List of lists of numeric values
        weights: List of numeric values for criteria weights
        criteria_types: List of booleans (True for benefit, False for cost)
        """
        self.alternatives = np.array(alternatives)
        self.weights = np.array(weights)
        self.criteria_types = criteria_types
        self.n_alternatives = len(alternatives)
        self.n_criteria = len(alternatives[0])
    
    def normalize_matrix(self):
        """Normalize using vector normalization"""
        # Calculate column-wise norms
        norms = np.sqrt(np.sum(self.alternatives ** 2, axis=0))
        # Avoid division by zero
        norms[norms == 0] = 1
        return self.alternatives / norms
    
    def calculate_weighted_matrix(self, normalized):
        """Apply weights to normalized matrix"""
        return normalized * self.weights
    
    def calculate_ideal_solutions(self, weighted):
        """Calculate positive and negative ideal solutions"""
        pis = []  # Positive Ideal Solution
        nis = []  # Negative Ideal Solution
        
        for j in range(self.n_criteria):
            if self.criteria_types[j]:  # Benefit
                pis.append(np.max(weighted[:, j]))
                nis.append(np.min(weighted[:, j]))
            else:  # Cost
                pis.append(np.min(weighted[:, j]))
                nis.append(np.max(weighted[:, j]))
        
        return np.array(pis), np.array(nis)
    
    def calculate_distances(self, weighted, pis, nis):
        """Calculate Euclidean distances from ideal solutions"""
        d_plus = np.sqrt(np.sum((weighted - pis) ** 2, axis=1))
        d_minus = np.sqrt(np.sum((weighted - nis) ** 2, axis=1))
        return d_plus, d_minus
    
    def calculate_closeness_coefficients(self, d_plus, d_minus):
        """Calculate closeness coefficients"""
        # Avoid division by zero
        denominator = d_plus + d_minus
        denominator[denominator == 0] = 1
        return d_minus / denominator
    
    def rank(self):
        """Perform complete crisp TOPSIS ranking"""
        normalized = self.normalize_matrix()
        weighted = self.calculate_weighted_matrix(normalized)
        pis, nis = self.calculate_ideal_solutions(weighted)
        d_plus, d_minus = self.calculate_distances(weighted, pis, nis)
        cc = self.calculate_closeness_coefficients(d_plus, d_minus)
        
        # Create rankings
        rankings = []
        for i, coefficient in enumerate(cc):
            rankings.append({
                'alternative_index': i,
                'closeness_coefficient': float(coefficient),
                'rank': 0
            })
        
        # Sort and assign ranks
        rankings.sort(key=lambda x: x['closeness_coefficient'], reverse=True)
        for rank, item in enumerate(rankings, 1):
            item['rank'] = rank
        
        return rankings
```

**New API Endpoint:** `/api/crisp-topsis/analyze`

```python
@app.route('/api/crisp-topsis/analyze', methods=['POST'])
def analyze_crisp():
    try:
        data = request.json
        
        # Parse alternatives (numeric values)
        alternatives = data['alternatives']
        weights = data['weights']
        criteria_types = data['criteria_types']
        
        # Run crisp TOPSIS
        topsis = CrispTOPSIS(alternatives, weights, criteria_types)
        rankings = topsis.rank()
        
        return jsonify({
            'success': True,
            'rankings': rankings
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

### 2. Frontend: New API Route for Crisp TOPSIS

**File:** `energy-site-selector/app/api/topsis/crisp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { FuzzySiteData } from '@/lib/fuzzyTypes';

const PYTHON_SERVICE_URL = process.env.PYTHON_TOPSIS_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const { sites, weights } = await request.json();

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No sites provided' },
        { status: 400 }
      );
    }

    // Extract most_likely values from fuzzy data
    const alternatives = sites.map((site: FuzzySiteData) => [
      site.criteria.solar_potential.most_likely,
      site.criteria.land_suitability.most_likely,
      site.criteria.grid_proximity.most_likely,
      site.criteria.installation_cost.most_likely,
    ]);

    // Extract most_likely from fuzzy weights
    const crispWeights = [
      weights.solar_potential,
      weights.land_suitability,
      weights.grid_proximity,
      weights.installation_cost,
    ];

    const criteriaTypes = [
      true,  // solar_potential (benefit)
      true,  // land_suitability (benefit)
      false, // grid_proximity (cost)
      false, // installation_cost (cost)
    ];

    // Call Python crisp TOPSIS service
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/crisp-topsis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alternatives,
        weights: crispWeights,
        criteria_types: criteriaTypes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python service returned ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Crisp TOPSIS analysis failed');
    }

    // Transform to frontend format
    const rankings = result.rankings.map((r: any) => {
      const site = sites[r.alternative_index];
      const score = r.closeness_coefficient * 100;

      return {
        site_id: site.site_id,
        rank: r.rank,
        topsis_score: score,
        viability: getViability(score),
        criteria_scores: {
          solar_potential: site.criteria.solar_potential.most_likely,
          land_suitability: site.criteria.land_suitability.most_likely,
          grid_proximity: site.criteria.grid_proximity.most_likely,
          installation_cost: site.criteria.installation_cost.most_likely,
        },
        location: site.location,
      };
    });

    return NextResponse.json({
      success: true,
      results: rankings,
    });
  } catch (error: any) {
    console.error('Crisp TOPSIS API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze sites',
      },
      { status: 500 }
    );
  }
}

function getViability(score: number): 'Excellent' | 'Good' | 'Fair' | 'Poor' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
```

### 3. Frontend: Type Definitions

**File:** `energy-site-selector/lib/topsisTypes.ts`

Add new types for comparison:

```typescript
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
```

### 4. Frontend: Comparison Utilities

**File:** `energy-site-selector/lib/comparisonUtils.ts`

```typescript
import { TOPSISResult } from './topsisTypes';
import { ComparisonResult, ComparisonMetrics, ComparisonData } from './topsisTypes';

export function calculateComparisonMetrics(
  fuzzyResults: TOPSISResult[],
  crispResults: TOPSISResult[]
): ComparisonData {
  const comparisonResults: ComparisonResult[] = [];
  
  // Create comparison for each site
  fuzzyResults.forEach((fuzzyResult) => {
    const crispResult = crispResults.find(r => r.site_id === fuzzyResult.site_id);
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
  
  // Calculate metrics
  const sitesWithRankChanges = comparisonResults.filter(r => r.rank_change !== 0).length;
  const maxRankDifference = Math.max(...comparisonResults.map(r => Math.abs(r.rank_change)));
  const avgScoreDifference = comparisonResults.reduce((sum, r) => 
    sum + Math.abs(r.score_difference), 0) / comparisonResults.length;
  
  // Calculate Spearman's rank correlation
  const rankCorrelation = calculateSpearmanCorrelation(
    comparisonResults.map(r => r.fuzzy_rank),
    comparisonResults.map(r => r.crisp_rank)
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

export function getRankChangeIcon(rankChange: number): string {
  if (rankChange > 0) return '↑'; // Improved in crisp
  if (rankChange < 0) return '↓'; // Worse in crisp
  return '='; // No change
}

export function getRankChangeColor(rankChange: number): string {
  if (rankChange > 0) return 'text-green-600';
  if (rankChange < 0) return 'text-red-600';
  return 'text-gray-400';
}
```

### 5. Frontend: Enhanced ControlPanel

**File:** `energy-site-selector/components/ControlPanel.tsx`

Add comparison mode toggle:

```typescript
interface ControlPanelProps {
  cellCount: number;
  siteCount: number;
  isAnalyzing: boolean;
  analysisProgress?: string;
  comparisonMode: boolean; // NEW
  onAnalyze: () => void;
  onClear: () => void;
  onToggleComparison: (enabled: boolean) => void; // NEW
}

// Add toggle in the UI:
<div className="mb-4 p-3 bg-gray-50 rounded-lg">
  <label className="flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={comparisonMode}
      onChange={(e) => onToggleComparison(e.target.checked)}
      className="mr-2 h-4 w-4"
    />
    <span className="text-sm font-medium text-gray-700">
      Compare Fuzzy vs Crisp TOPSIS
    </span>
  </label>
  {comparisonMode && (
    <p className="text-xs text-gray-500 mt-1">
      Shows side-by-side comparison of uncertainty-aware (fuzzy) vs traditional (crisp) analysis
    </p>
  )}
</div>
```

### 6. Frontend: Enhanced ResultsPanel

**File:** `energy-site-selector/components/ResultsPanel.tsx`

Add comparison view mode:

```typescript
interface ResultsPanelProps {
  results: TOPSISResult[];
  comparisonData?: ComparisonData; // NEW
  onSiteClick: (siteId: string) => void;
}

// Render comparison view when comparisonData is provided:
if (comparisonData) {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-4xl max-h-[80vh] overflow-y-auto">
      {/* Comparison Summary */}
      <ComparisonSummary metrics={comparisonData.metrics} />
      
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Fuzzy TOPSIS</h3>
          {/* Render fuzzy results */}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Crisp TOPSIS</h3>
          {/* Render crisp results */}
        </div>
      </div>
      
      {/* Detailed comparison table */}
      <ComparisonTable results={comparisonData.comparison_results} />
    </div>
  );
}

// Otherwise render normal single-method view
```

**New Sub-component:** `ComparisonSummary`

```typescript
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
```

**New Sub-component:** `ComparisonTable`

```typescript
function ComparisonTable({ results }: { results: ComparisonResult[] }) {
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
              <tr key={result.site_id} className="border-b hover:bg-gray-50">
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
```

### 7. Frontend: MapContainer Integration

**File:** `energy-site-selector/components/MapContainer.tsx`

Update to handle comparison mode:

```typescript
const [comparisonMode, setComparisonMode] = useState(false);
const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

const handleAnalyze = async () => {
  if (comparisonMode) {
    // Run both analyses in parallel
    const [fuzzyResponse, crispResponse] = await Promise.all([
      fetch('/api/topsis', { /* fuzzy request */ }),
      fetch('/api/topsis/crisp', { /* crisp request */ })
    ]);
    
    const fuzzyData = await fuzzyResponse.json();
    const crispData = await crispResponse.json();
    
    const comparison = calculateComparisonMetrics(
      fuzzyData.results,
      crispData.results
    );
    
    setComparisonData(comparison);
  } else {
    // Run only fuzzy analysis (existing behavior)
    // ...
  }
};
```

## Data Models

### Crisp TOPSIS Request/Response

**Request:**
```json
{
  "alternatives": [
    [200.5, 85.3, 4.2, 1450.0],
    [195.2, 82.1, 5.8, 1520.0]
  ],
  "weights": [0.4, 0.3, 0.2, 0.1],
  "criteria_types": [true, true, false, false]
}
```

**Response:**
```json
{
  "success": true,
  "rankings": [
    {
      "alternative_index": 0,
      "closeness_coefficient": 0.752,
      "rank": 1
    },
    {
      "alternative_index": 1,
      "closeness_coefficient": 0.648,
      "rank": 2
    }
  ]
}
```

## Error Handling

### Backend Errors

1. **Invalid input data**: Return 400 with descriptive error message
2. **Calculation errors**: Return 500 with error details
3. **Service unavailable**: Return 503 with retry information

### Frontend Errors

1. **API call failures**: Display error toast, allow retry
2. **Partial failures**: If one method fails, show results from successful method with warning
3. **Network errors**: Show connection error message with retry button

### Error Recovery

- If crisp TOPSIS fails, fall back to showing only fuzzy results
- If fuzzy TOPSIS fails, fall back to showing only crisp results
- If both fail, show error message with option to retry

## Testing Strategy

### Unit Tests

**Backend (Python):**
- Test `CrispTOPSIS` class methods individually
- Test normalization with various input matrices
- Test ideal solution calculation for benefit/cost criteria
- Test distance calculations
- Test edge cases (zero values, identical alternatives)

**Frontend (TypeScript):**
- Test `calculateComparisonMetrics` with various result sets
- Test `calculateSpearmanCorrelation` with known inputs
- Test data transformation functions
- Test rank change calculations

### Integration Tests

1. **End-to-end comparison flow:**
   - Enable comparison mode
   - Select sites
   - Trigger analysis
   - Verify both API calls are made
   - Verify comparison metrics are calculated
   - Verify UI displays comparison correctly

2. **API endpoint tests:**
   - Test `/api/crisp-topsis/analyze` with valid data
   - Test error handling for invalid inputs
   - Test response format matches specification

### Component Tests

1. **ControlPanel:**
   - Test comparison toggle interaction
   - Test analyze button behavior in comparison mode

2. **ResultsPanel:**
   - Test comparison view rendering
   - Test normal view rendering
   - Test switching between modes
   - Test comparison summary display
   - Test comparison table rendering

### Performance Considerations

- Parallel API calls should complete within 5 seconds for 10 sites
- UI should remain responsive during analysis
- Comparison calculations should be < 100ms for 50 sites

## Export Functionality

### Export Format (JSON)

```json
{
  "timestamp": "2025-10-29T10:30:00Z",
  "analysis_type": "comparison",
  "parameters": {
    "weights": {
      "solar_potential": 0.4,
      "land_suitability": 0.3,
      "grid_proximity": 0.2,
      "installation_cost": 0.1
    }
  },
  "metrics": {
    "sites_with_rank_changes": 5,
    "max_rank_difference": 3,
    "average_score_difference": 2.4,
    "rank_correlation": 0.892
  },
  "results": [
    {
      "site_id": "site_1",
      "fuzzy_rank": 1,
      "crisp_rank": 1,
      "fuzzy_score": 85.2,
      "crisp_score": 83.7,
      "location": {"lat": 40.7128, "lng": -74.0060}
    }
  ]
}
```

### Export Implementation

**File:** `energy-site-selector/lib/exportUtils.ts`

```typescript
export function exportComparisonData(
  comparisonData: ComparisonData,
  weights: any,
  format: 'json' | 'csv'
): void {
  if (format === 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      analysis_type: 'comparison',
      parameters: { weights },
      metrics: comparisonData.metrics,
      results: comparisonData.comparison_results,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, `topsis-comparison-${Date.now()}.json`);
  } else {
    // CSV export implementation
    const csv = convertToCSV(comparisonData.comparison_results);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `topsis-comparison-${Date.now()}.csv`);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## UI/UX Considerations

### Visual Design

- Use color coding to indicate rank improvements (green ↑) and declines (red ↓)
- Highlight sites with significant rank changes (> 2 positions)
- Use side-by-side layout for easy comparison
- Provide tooltips explaining metrics (e.g., "Rank correlation: measures how similar the two rankings are")

### User Guidance

- Add help text explaining the difference between fuzzy and crisp TOPSIS
- Show loading states for both analyses
- Provide clear error messages if one method fails
- Add export button prominently in comparison view

### Responsive Design

- Comparison view should stack vertically on mobile devices
- Table should be horizontally scrollable on small screens
- Summary metrics should remain visible when scrolling

## Performance Optimization

1. **Parallel API calls**: Use `Promise.all()` to run both analyses simultaneously
2. **Memoization**: Cache comparison calculations to avoid recalculation on re-renders
3. **Lazy loading**: Only calculate detailed comparison metrics when user expands comparison view
4. **Debouncing**: Debounce comparison toggle to prevent rapid API calls

## Future Enhancements

1. **Sensitivity analysis**: Show how rank changes with different weight distributions
2. **Visualization**: Add charts showing rank changes and score distributions
3. **Historical comparison**: Save and compare multiple analysis runs
4. **Confidence intervals**: Display uncertainty ranges for fuzzy results
5. **Custom fuzzy parameters**: Allow users to adjust uncertainty levels (±10%, ±20%, etc.)
