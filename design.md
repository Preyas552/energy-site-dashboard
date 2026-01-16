# Design Document: Next.js Solar Site Selector

## Overview

The Solar Site Selector is a focused Next.js application that enables users to interactively select potential solar installation sites on a map, fetches real solar data from NASA POWER API, processes historical patterns into fuzzy numbers, and ranks sites using fuzzy TOPSIS algorithm. The application emphasizes simplicity, performance, and accurate data-driven decision making.

**Key Design Principles:**
- Minimal UI with only essential controls
- Server-side API calls to protect credentials
- Fuzzy logic to represent uncertainty in solar data
- Separation of concerns (Next.js frontend, Python TOPSIS service)
- Performance-first approach with code splitting and caching

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Next.js Application                    │
│                  (energy-site-selector)                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Client Components (Browser)              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │   Map      │  │   Grid     │  │  Results  │  │  │
│  │  │ Component  │  │  Selector  │  │   Panel   │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Server Components & API Routes           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐  │  │
│  │  │ NASA POWER │  │   Google   │  │  TOPSIS   │  │  │
│  │  │   Proxy    │  │Solar Proxy │  │   Proxy   │  │  │
│  │  └────────────┘  └────────────┘  └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│            Python Flask TOPSIS Service                  │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Fuzzy    │  │  TOPSIS    │  │ Historical │       │
│  │  Numbers   │  │ Algorithm  │  │  Analysis  │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  External APIs                          │
│  ┌────────────┐  ┌────────────┐                        │
│  │ NASA POWER │  │   Google   │                        │
│  │    API     │  │ Solar API  │                        │
│  └────────────┘  └────────────┘                        │
└─────────────────────────────────────────────────────────┘
```


### Component Architecture

```
app/
├── page.tsx (Main entry point)
│   └── MapContainer (Client Component)
│       ├── MapboxMap (Mapbox GL JS)
│       ├── GridLayer (Deck.gl GridLayer)
│       ├── SelectionManager (State management)
│       ├── ControlPanel
│       │   ├── SelectionInfo
│       │   ├── AnalyzeButton
│       │   └── ClearButton
│       └── ResultsPanel
│           ├── RankedSitesList
│           └── SiteDetailsPopup
│
├── api/
│   ├── nasa-power/
│   │   └── route.ts (Fetch solar data)
│   ├── google-solar/
│   │   └── route.ts (Fetch solar potential)
│   └── topsis/
│       └── route.ts (Proxy to Python service)
│
└── lib/
    ├── gridUtils.ts (Grid generation, merging)
    ├── fuzzyUtils.ts (Fuzzy number generation)
    └── apiClient.ts (API call utilities)
```

## Components and Interfaces

### Core Components

#### 1. MapContainer (Client Component)
**Purpose:** Main container managing map, grid, and user interactions

**State:**
```typescript
interface MapState {
  selectedCells: GridCell[];
  mergedSites: Site[];
  analysisResults: TOPSISResult[] | null;
  isAnalyzing: boolean;
  error: string | null;
}
```

**Key Methods:**
- `handleCellClick(cell: GridCell)` - Toggle cell selection
- `handleAnalyze()` - Trigger analysis workflow
- `handleClear()` - Reset all selections
- `mergeCells(cells: GridCell[])` - Detect and merge adjacent cells



#### 2. GridLayer (Deck.gl Component)
**Purpose:** Renders interactive grid overlay on map

**Configuration:**
```typescript
interface GridLayerConfig {
  cellSize: number; // km (default: 1)
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  selectedCells: GridCell[];
  onCellClick: (cell: GridCell) => void;
}
```

**Visual States:**
- Unselected: Transparent with light border
- Selected: Blue fill with solid border
- Merged: Green fill with thick border
- Ranked: Color-coded by TOPSIS score

#### 3. ControlPanel (Client Component)
**Purpose:** Display selection info and action buttons

**Props:**
```typescript
interface ControlPanelProps {
  cellCount: number;
  siteCount: number;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClear: () => void;
}
```

#### 4. ResultsPanel (Client Component)
**Purpose:** Display ranked sites after analysis

**Props:**
```typescript
interface ResultsPanelProps {
  results: TOPSISResult[];
  onSiteClick: (siteId: string) => void;
}
```



## Data Models

### Grid Cell
```typescript
interface GridCell {
  id: string; // "cell_lat_lng"
  lat: number;
  lng: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  selected: boolean;
}
```

### Site (Merged Cells)
```typescript
interface Site {
  id: string;
  cells: GridCell[];
  centroid: {
    lat: number;
    lng: number;
  };
  area_km2: number;
}
```

### Solar Data (from NASA POWER)
```typescript
interface SolarData {
  site_id: string;
  current_year: {
    year: number;
    daily_values: {
      date: string; // "YYYYMMDD"
      ghi: number; // W/m²
      dni: number; // W/m²
      dhi: number; // W/m²
    }[];
    average_ghi: number;
  };
  historical_5_years: {
    years: number[]; // [2019, 2020, 2021, 2022, 2023]
    daily_values: {
      date: string;
      ghi: number;
      dni: number;
      dhi: number;
    }[];
    average_ghi: number;
    std_dev: number;
    min: number;
    max: number;
  };
}
```



### Fuzzy Number
```typescript
interface FuzzyNumber {
  lower: number; // Pessimistic (historical min or mean - std_dev)
  most_likely: number; // Expected (current year average)
  upper: number; // Optimistic (historical max or mean + std_dev)
}
```

### Fuzzy Site Data
```typescript
interface FuzzySiteData {
  site_id: string;
  criteria: {
    solar_potential: FuzzyNumber; // GHI in W/m²
    land_suitability: FuzzyNumber; // 0-100 score
    grid_proximity: FuzzyNumber; // Distance in km
    installation_cost: FuzzyNumber; // $/kW
  };
  metadata: {
    historical_years: number;
    current_year_days: number;
    confidence: number; // 0-1
  };
}
```

### TOPSIS Result
```typescript
interface TOPSISResult {
  site_id: string;
  rank: number;
  topsis_score: number; // 0-100
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
```



## Data Flow

### Complete Analysis Workflow

```
1. User Selects Grid Cells
   ↓
2. Adjacent Cells Merge into Sites
   ↓
3. User Clicks "Analyze Sites"
   ↓
4. For Each Site:
   ├─→ Fetch Current Year Data (NASA POWER)
   ├─→ Fetch 5-Year Historical Data (NASA POWER)
   ├─→ Calculate Statistics (mean, std_dev, min, max)
   ├─→ Generate Fuzzy Numbers
   │   ├─ Lower: historical_mean - std_dev
   │   ├─ Most Likely: current_year_average
   │   └─ Upper: historical_mean + std_dev
   └─→ Consolidate Fuzzy Criteria
   ↓
5. Send All Fuzzy Site Data to Python Service
   ↓
6. Python Service Executes Fuzzy TOPSIS
   ├─→ Normalize fuzzy decision matrix
   ├─→ Apply criteria weights
   ├─→ Calculate fuzzy ideal solutions
   ├─→ Compute fuzzy distances
   └─→ Calculate closeness coefficients
   ↓
7. Return Ranked Results to Next.js
   ↓
8. Display Results on Map
   └─→ Color-code by rank
   └─→ Show #1 site prominently
```



### API Call Sequence

```typescript
// Step 1: Fetch solar data for a site
async function fetchSolarData(site: Site): Promise<SolarData> {
  const response = await fetch('/api/nasa-power', {
    method: 'POST',
    body: JSON.stringify({
      lat: site.centroid.lat,
      lng: site.centroid.lng,
      current_year: 2024,
      historical_years: 5
    })
  });
  return response.json();
}

// Step 2: Generate fuzzy numbers from solar data
function generateFuzzyNumbers(solarData: SolarData): FuzzySiteData {
  const hist = solarData.historical_5_years;
  const curr = solarData.current_year;
  
  return {
    site_id: solarData.site_id,
    criteria: {
      solar_potential: {
        lower: hist.average_ghi - hist.std_dev,
        most_likely: curr.average_ghi,
        upper: hist.average_ghi + hist.std_dev
      },
      // ... other criteria
    },
    metadata: {
      historical_years: hist.years.length,
      current_year_days: curr.daily_values.length,
      confidence: calculateConfidence(hist, curr)
    }
  };
}

// Step 3: Send to TOPSIS service
async function analyzeSites(fuzzySites: FuzzySiteData[]): Promise<TOPSISResult[]> {
  const response = await fetch('/api/topsis', {
    method: 'POST',
    body: JSON.stringify({
      sites: fuzzySites,
      weights: {
        solar_potential: 0.4,
        land_suitability: 0.3,
        grid_proximity: 0.2,
        installation_cost: 0.1
      }
    })
  });
  return response.json();
}
```



## Fuzzy Number Generation Algorithm

### Statistical Method (Primary Approach)

```typescript
function generateFuzzyFromHistorical(
  currentYearAvg: number,
  historicalData: number[]
): FuzzyNumber {
  // Calculate statistics
  const mean = historicalData.reduce((a, b) => a + b) / historicalData.length;
  const variance = historicalData.reduce((sum, val) => 
    sum + Math.pow(val - mean, 2), 0) / historicalData.length;
  const stdDev = Math.sqrt(variance);
  
  // Generate fuzzy number
  return {
    lower: Math.max(0, mean - stdDev), // Pessimistic
    most_likely: currentYearAvg, // Expected
    upper: mean + stdDev // Optimistic
  };
}
```

### Confidence Calculation

```typescript
function calculateConfidence(
  historical: HistoricalData,
  current: CurrentYearData
): number {
  // Factors affecting confidence:
  // 1. Sample size (more years = higher confidence)
  const sampleFactor = Math.min(historical.years.length / 5, 1.0);
  
  // 2. Data consistency (lower std_dev = higher confidence)
  const coefficientOfVariation = historical.std_dev / historical.average_ghi;
  const consistencyFactor = Math.max(0, 1 - coefficientOfVariation);
  
  // 3. Current year alignment with historical (closer = higher confidence)
  const deviation = Math.abs(current.average_ghi - historical.average_ghi);
  const alignmentFactor = Math.max(0, 1 - (deviation / historical.average_ghi));
  
  // Weighted combination
  return (sampleFactor * 0.3 + consistencyFactor * 0.4 + alignmentFactor * 0.3);
}
```



## Grid System Design

### Grid Generation

```typescript
interface GridConfig {
  cellSize: number; // km
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

function generateGrid(config: GridConfig): GridCell[] {
  const cells: GridCell[] = [];
  const { cellSize, bounds } = config;
  
  // Convert km to degrees (approximate)
  const latStep = cellSize / 111; // 1 degree ≈ 111 km
  const lngStep = cellSize / (111 * Math.cos(bounds.north * Math.PI / 180));
  
  for (let lat = bounds.south; lat < bounds.north; lat += latStep) {
    for (let lng = bounds.west; lng < bounds.east; lng += lngStep) {
      cells.push({
        id: `cell_${lat.toFixed(4)}_${lng.toFixed(4)}`,
        lat: lat + latStep / 2,
        lng: lng + lngStep / 2,
        bounds: {
          north: lat + latStep,
          south: lat,
          east: lng + lngStep,
          west: lng
        },
        selected: false
      });
    }
  }
  
  return cells;
}
```

### Adjacent Cell Detection

```typescript
function areAdjacent(cell1: GridCell, cell2: GridCell): boolean {
  const latDiff = Math.abs(cell1.lat - cell2.lat);
  const lngDiff = Math.abs(cell1.lng - cell2.lng);
  
  // Cells are adjacent if they share an edge
  const cellSize = 1 / 111; // 1 km in degrees
  const tolerance = cellSize * 0.1; // 10% tolerance
  
  return (
    (latDiff < cellSize + tolerance && lngDiff < tolerance) || // Vertical neighbors
    (lngDiff < cellSize + tolerance && latDiff < tolerance)    // Horizontal neighbors
  );
}
```



### Site Merging Algorithm

```typescript
function mergeCells(selectedCells: GridCell[]): Site[] {
  const sites: Site[] = [];
  const visited = new Set<string>();
  
  for (const cell of selectedCells) {
    if (visited.has(cell.id)) continue;
    
    // Find all connected cells using BFS
    const connectedCells: GridCell[] = [];
    const queue = [cell];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id)) continue;
      
      visited.add(current.id);
      connectedCells.push(current);
      
      // Find adjacent unvisited cells
      for (const neighbor of selectedCells) {
        if (!visited.has(neighbor.id) && areAdjacent(current, neighbor)) {
          queue.push(neighbor);
        }
      }
    }
    
    // Create site from connected cells
    sites.push({
      id: `site_${sites.length + 1}`,
      cells: connectedCells,
      centroid: calculateCentroid(connectedCells),
      area_km2: connectedCells.length * 1 // Assuming 1km² cells
    });
  }
  
  return sites;
}

function calculateCentroid(cells: GridCell[]): { lat: number; lng: number } {
  const sumLat = cells.reduce((sum, cell) => sum + cell.lat, 0);
  const sumLng = cells.reduce((sum, cell) => sum + cell.lng, 0);
  
  return {
    lat: sumLat / cells.length,
    lng: sumLng / cells.length
  };
}
```



## API Routes Design

### NASA POWER API Route

**File:** `app/api/nasa-power/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, current_year, historical_years } = await request.json();
    
    // Fetch current year data
    const currentData = await fetchNASAPower(lat, lng, current_year, current_year);
    
    // Fetch historical data
    const startYear = current_year - historical_years;
    const historicalData = await fetchNASAPower(lat, lng, startYear, current_year - 1);
    
    // Process and return
    return NextResponse.json({
      success: true,
      data: {
        current_year: processCurrentYear(currentData),
        historical_5_years: processHistorical(historicalData)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function fetchNASAPower(
  lat: number,
  lng: number,
  startYear: number,
  endYear: number
) {
  const params = new URLSearchParams({
    parameters: 'ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF',
    community: 'RE',
    longitude: lng.toString(),
    latitude: lat.toString(),
    start: `${startYear}0101`,
    end: `${endYear}1231`,
    format: 'JSON'
  });
  
  const response = await fetch(
    `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`
  );
  
  return response.json();
}
```



### TOPSIS API Route

**File:** `app/api/topsis/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_TOPSIS_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const { sites, weights } = await request.json();
    
    // Forward to Python Flask service
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/fuzzy-topsis/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alternatives: sites.map(site => [
          site.criteria.solar_potential,
          site.criteria.land_suitability,
          site.criteria.grid_proximity,
          site.criteria.installation_cost
        ]),
        weights: Object.values(weights),
        criteria_types: [true, true, false, false], // benefit/cost
        fuzzy: true
      })
    });
    
    const result = await response.json();
    
    // Transform Python response to our format
    return NextResponse.json({
      success: true,
      results: result.rankings.map((r, idx) => ({
        site_id: sites[r.alternative_index].site_id,
        rank: r.rank,
        topsis_score: r.closeness_coefficient * 100,
        viability: getViability(r.closeness_coefficient * 100),
        location: sites[r.alternative_index].location
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function getViability(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
```



## Python TOPSIS Service

### Service Structure

```
topsis-service/
├── app.py (Flask application)
├── fuzzy_topsis.py (Existing implementation)
├── requirements.txt
└── Dockerfile
```

### Flask Endpoint

```python
from flask import Flask, request, jsonify
from fuzzy_topsis import FuzzyTOPSIS, TriangularFuzzyNumber

app = Flask(__name__)

@app.route('/api/fuzzy-topsis/analyze', methods=['POST'])
def analyze():
    data = request.json
    
    # Convert to fuzzy numbers
    fuzzy_alternatives = []
    for alt in data['alternatives']:
        fuzzy_alt = []
        for criterion in alt:
            fuzzy_alt.append(TriangularFuzzyNumber(
                criterion['lower'],
                criterion['most_likely'],
                criterion['upper']
            ))
        fuzzy_alternatives.append(fuzzy_alt)
    
    # Create fuzzy weights
    fuzzy_weights = [
        TriangularFuzzyNumber(w * 0.9, w, w * 1.1)
        for w in data['weights']
    ]
    
    # Run fuzzy TOPSIS
    topsis = FuzzyTOPSIS(
        alternatives=fuzzy_alternatives,
        weights=fuzzy_weights,
        criteria_types=data['criteria_types'],
        convert_to_fuzzy=False
    )
    
    rankings = topsis.rank()
    
    return jsonify({
        'success': True,
        'rankings': rankings
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
```



## Error Handling

### Client-Side Error Handling

```typescript
interface ErrorState {
  type: 'network' | 'api' | 'validation' | 'topsis';
  message: string;
  details?: any;
}

function handleAnalysisError(error: Error): ErrorState {
  if (error.message.includes('NASA POWER')) {
    return {
      type: 'api',
      message: 'Failed to fetch solar data. Please try again.',
      details: error
    };
  }
  
  if (error.message.includes('TOPSIS')) {
    return {
      type: 'topsis',
      message: 'Analysis failed. Please check your selections.',
      details: error
    };
  }
  
  return {
    type: 'network',
    message: 'Network error. Please check your connection.',
    details: error
  };
}
```

### API Route Error Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... main logic
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code || 'UNKNOWN_ERROR',
          timestamp: new Date().toISOString()
        }
      },
      { status: error.status || 500 }
    );
  }
}
```



## Performance Optimization

### Code Splitting

```typescript
// Lazy load map components
const MapContainer = dynamic(() => import('@/components/MapContainer'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

// Lazy load Deck.gl
const DeckGL = dynamic(() => import('@deck.gl/react').then(mod => mod.default), {
  ssr: false
});
```

### Caching Strategy

```typescript
// Cache NASA POWER responses for 24 hours
export const revalidate = 86400; // seconds

// Cache TOPSIS results in memory
const resultsCache = new Map<string, TOPSISResult[]>();

function getCacheKey(sites: Site[]): string {
  return sites.map(s => `${s.centroid.lat},${s.centroid.lng}`).join('|');
}
```

### Parallel API Calls

```typescript
async function fetchAllSolarData(sites: Site[]): Promise<SolarData[]> {
  // Fetch all sites in parallel
  const promises = sites.map(site => fetchSolarData(site));
  
  // Use Promise.allSettled to handle partial failures
  const results = await Promise.allSettled(promises);
  
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}
```



## Testing Strategy

### Unit Tests

```typescript
// gridUtils.test.ts
describe('Grid Utilities', () => {
  test('generates correct number of cells', () => {
    const grid = generateGrid({
      cellSize: 1,
      bounds: { north: 44, south: 43, east: -79, west: -80 }
    });
    expect(grid.length).toBeGreaterThan(0);
  });
  
  test('detects adjacent cells correctly', () => {
    const cell1 = { lat: 43.5, lng: -79.5, ... };
    const cell2 = { lat: 43.5, lng: -79.4, ... };
    expect(areAdjacent(cell1, cell2)).toBe(true);
  });
  
  test('merges adjacent cells into sites', () => {
    const cells = [cell1, cell2, cell3];
    const sites = mergeCells(cells);
    expect(sites.length).toBeLessThanOrEqual(cells.length);
  });
});

// fuzzyUtils.test.ts
describe('Fuzzy Number Generation', () => {
  test('generates valid fuzzy number', () => {
    const fuzzy = generateFuzzyFromHistorical(850, [800, 820, 840, 860, 880]);
    expect(fuzzy.lower).toBeLessThan(fuzzy.most_likely);
    expect(fuzzy.most_likely).toBeLessThan(fuzzy.upper);
  });
  
  test('calculates confidence correctly', () => {
    const confidence = calculateConfidence(historical, current);
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});
```

### Integration Tests

```typescript
// api.test.ts
describe('NASA POWER API Route', () => {
  test('fetches solar data successfully', async () => {
    const response = await fetch('/api/nasa-power', {
      method: 'POST',
      body: JSON.stringify({
        lat: 43.7,
        lng: -79.4,
        current_year: 2024,
        historical_years: 5
      })
    });
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.current_year).toBeDefined();
    expect(data.data.historical_5_years).toBeDefined();
  });
});
```



## Deployment Architecture

### Docker Compose Setup

```yaml
version: '3.8'

services:
  nextjs:
    build: ./energy-site-selector
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_MAPBOX_TOKEN=${MAPBOX_TOKEN}
      - PYTHON_TOPSIS_URL=http://topsis:5001
    depends_on:
      - topsis

  topsis:
    build: ./topsis-service
    ports:
      - "5001:5001"
    environment:
      - FLASK_ENV=production
```

### Environment Variables

```bash
# .env.example

# Client-side (exposed to browser)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Server-side (secure)
NASA_POWER_API_URL=https://power.larc.nasa.gov/api
GOOGLE_SOLAR_API_KEY=your_google_api_key_here
PYTHON_TOPSIS_URL=http://localhost:5001

# Optional
CACHE_TTL=86400
MAX_SITES=20
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_MAPBOX_TOKEN": "@mapbox-token",
    "PYTHON_TOPSIS_URL": "@topsis-service-url"
  }
}
```



## Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Map:** Mapbox GL JS 3.x
- **Visualization:** Deck.gl 8.x
- **UI:** Minimal custom CSS (no UI library needed)
- **State:** React hooks (useState, useEffect)

### Backend
- **API Routes:** Next.js API Routes
- **Runtime:** Node.js 20+
- **HTTP Client:** Native fetch API

### Python Service
- **Framework:** Flask 3.x
- **Algorithm:** Existing fuzzy_topsis.py
- **Dependencies:** numpy, scipy

### External APIs
- **NASA POWER:** Solar irradiance data
- **Google Solar API:** Solar potential (optional)

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest + React Testing Library

## Summary

This design provides a focused, minimal architecture for the Solar Site Selector application. Key design decisions:

1. **Separation of Concerns:** Next.js handles UI and API proxying, Python handles complex TOPSIS calculations
2. **Fuzzy Logic Integration:** Historical data drives fuzzy number generation, representing real-world uncertainty
3. **Performance First:** Code splitting, caching, and parallel API calls ensure smooth user experience
4. **Minimal UI:** Only essential controls, no bloat
5. **Standalone Deployment:** Can be deployed independently via Docker or Vercel

The design emphasizes simplicity while maintaining the sophisticated fuzzy TOPSIS analysis at its core.
