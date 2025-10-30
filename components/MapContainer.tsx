'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { GridCell, Site } from '@/lib/types';
import { generateGrid, mergeCells } from '@/lib/gridUtils';
import { createGridLayer } from './GridLayer';
import ControlPanel from './ControlPanel';
import ResultsPanel from './ResultsPanel';
import { ComparisonData } from '@/lib/topsisTypes';
import { calculateComparisonMetrics } from '@/lib/comparisonUtils';

interface MapContainerProps {
  mapboxToken: string;
  allowRotation?: boolean; // Optional: allow map rotation (default: false)
}

export default function MapContainer({ mapboxToken, allowRotation = false }: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [fuzzySiteData, setFuzzySiteData] = useState<any[]>([]);

  useEffect(() => {
    if (!mapboxToken) {
      console.error('Mapbox token is required');
      setIsLoading(false);
      return;
    }

    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = mapboxToken;

    if (mapContainer.current) {
      console.log('Initializing map with token:', mapboxToken.substring(0, 10) + '...');

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-79.4, 43.7], // GTA region (Toronto)
          zoom: 10,
          pitch: 0,
          bearing: 0,
          // Disable rotation to keep grid aligned north (unless explicitly allowed)
          dragRotate: allowRotation,
          touchZoomRotate: allowRotation,
          touchPitch: allowRotation,
        });
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setIsLoading(false);
        return;
      }

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: allowRotation, // Show compass only if rotation is allowed
          showZoom: true,
        }),
        'top-right'
      );

      // Initialize Deck.gl overlay
      deckOverlay.current = new MapboxOverlay({
        interleaved: true,
        layers: [],
      });
      map.current.addControl(deckOverlay.current as any);

      // Handle load event
      map.current.on('load', () => {
        setIsLoading(false);

        // Generate initial grid based on current viewport
        // Grid is aligned to fixed geographic coordinates for consistency
        const bounds = map.current?.getBounds();
        if (bounds) {
          const initialCells = generateGrid({
            cellSize: 1, // 1km cells
            bounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            },
            // Optional: Align to specific landmark (e.g., CN Tower)
            // origin: { lat: 43.6426, lng: -79.3871 }
          });
          setCells(initialCells);
        }
      });

      // Handle errors
      map.current.on('error', (e) => {
        // Only log if there's actual error content
        if (e && e.error && e.error.message) {
          console.error('Map error:', e.error.message);
        }
        // Don't set loading to false for minor errors
      });
    }

    // Cleanup on unmount
    return () => {
      if (deckOverlay.current) {
        deckOverlay.current.finalize();
        deckOverlay.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update Deck.gl layers when cells, sites, or results change
  useEffect(() => {
    if (deckOverlay.current && cells.length > 0) {
      const gridLayer = createGridLayer({
        cells,
        sites,
        results: analysisResults,
        onCellClick: handleCellClick,
      });
      deckOverlay.current.setProps({ layers: [gridLayer] });
    }
  }, [cells, sites, analysisResults]);

  const handleCellClick = (cell: GridCell) => {
    setCells((prevCells) =>
      prevCells.map((c) =>
        c.id === cell.id ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const handleClear = () => {
    setCells((prevCells) =>
      prevCells.map((c) => ({ ...c, selected: false }))
    );
  };

  const handleAnalyze = async () => {
    if (sites.length === 0) {
      alert('Please select at least one site');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Initializing analysis...');

    try {
      // Step 1: Fetch solar data for all sites
      setAnalysisProgress(`Fetching solar data for ${sites.length} site(s)...`);
      const { fetchSolarDataForAllSites } = await import('@/lib/solarDataUtils');

      const solarDataArray = await fetchSolarDataForAllSites(sites, (current, total) => {
        setAnalysisProgress(`Fetching solar data: ${current}/${total} sites`);
      });

      if (solarDataArray.length === 0) {
        throw new Error('Failed to fetch solar data for any sites');
      }

      // Step 2: Generate fuzzy numbers
      setAnalysisProgress('Generating fuzzy numbers from historical data...');
      const { generateFuzzySiteDataForAll } = await import('@/lib/fuzzyUtils');
      const generatedFuzzySiteData = generateFuzzySiteDataForAll(solarDataArray);

      console.log('Generated fuzzy site data:', generatedFuzzySiteData);
      console.log('Sample fuzzy criteria:', generatedFuzzySiteData[0]?.criteria);
      
      // Store fuzzy site data for visualization
      setFuzzySiteData(generatedFuzzySiteData);

      const weights = {
        solar_potential: 0.4,
        land_suitability: 0.3,
        grid_proximity: 0.2,
        installation_cost: 0.1,
      };

      // Step 3: Run TOPSIS analysis (fuzzy or comparison mode)
      if (comparisonMode) {
        setAnalysisProgress('Running both fuzzy and crisp TOPSIS analyses...');
        
        try {
          // Run both analyses in parallel
          const [fuzzyResponse, crispResponse] = await Promise.all([
            fetch('/api/topsis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sites: generatedFuzzySiteData, weights }),
            }),
            fetch('/api/topsis/crisp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sites: generatedFuzzySiteData, weights }),
            }),
          ]);

          if (!fuzzyResponse.ok) {
            const error = await fuzzyResponse.json();
            throw new Error(`Fuzzy TOPSIS failed: ${error.error || 'Unknown error'}`);
          }

          if (!crispResponse.ok) {
            const error = await crispResponse.json();
            throw new Error(`Crisp TOPSIS failed: ${error.error || 'Unknown error'}`);
          }

          const fuzzyResult = await fuzzyResponse.json();
          const crispResult = await crispResponse.json();

          if (!fuzzyResult.success || !crispResult.success) {
            throw new Error('One or both analyses failed');
          }

          // Calculate comparison metrics
          setAnalysisProgress('Calculating comparison metrics...');
          const comparison = calculateComparisonMetrics(
            fuzzyResult.results,
            crispResult.results
          );

          setComparisonData(comparison);
          setAnalysisResults(fuzzyResult.results); // Keep fuzzy results for map visualization
          setAnalysisProgress('Comparison analysis complete!');

        } catch (fetchError: any) {
          throw new Error(
            fetchError.message || 'Cannot connect to TOPSIS service. Make sure the Python service is running on http://localhost:5001'
          );
        }
      } else {
        // Run only fuzzy TOPSIS (existing behavior)
        setAnalysisProgress('Running fuzzy TOPSIS analysis...');
        let response;
        try {
          response = await fetch('/api/topsis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sites: generatedFuzzySiteData,
              weights,
            }),
          });
        } catch (fetchError) {
          throw new Error(
            'Cannot connect to TOPSIS service. Make sure the Python service is running on http://localhost:5001'
          );
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'TOPSIS analysis failed');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Analysis failed');
        }

        console.log('Raw TOPSIS response:', result);
        console.log('Analysis results:', result.results);

        if (result.results && result.results.length > 0) {
          console.log('First result TOPSIS score:', result.results[0].topsis_score);
        }

        setAnalysisResults(result.results);
        setComparisonData(null); // Clear comparison data
        setAnalysisProgress('Analysis complete!');
      }

    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
      setAnalysisProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate selected cell count and merge into sites
  const selectedCellCount = useMemo(
    () => cells.filter((c) => c.selected).length,
    [cells]
  );

  // Merge selected cells into sites
  useEffect(() => {
    const selectedCells = cells.filter((c) => c.selected);
    if (selectedCells.length > 0) {
      const mergedSites = mergeCells(selectedCells);
      setSites(mergedSites);
    } else {
      setSites([]);
    }
  }, [cells]);

  const siteCount = sites.length;

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Mapbox token not configured</p>
          <p className="text-gray-600 text-sm mt-2">
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainer} className="w-full h-full" />
      <ControlPanel
        cellCount={selectedCellCount}
        siteCount={siteCount}
        isAnalyzing={isAnalyzing}
        analysisProgress={analysisProgress}
        comparisonMode={comparisonMode}
        onAnalyze={handleAnalyze}
        onClear={handleClear}
        onToggleComparison={(enabled) => {
          setComparisonMode(enabled);
          if (!enabled) {
            setComparisonData(null); // Clear comparison data when disabling
          }
        }}
      />
      {(analysisResults.length > 0 || comparisonData) && (
        <ResultsPanel
          results={analysisResults}
          comparisonData={comparisonData || undefined}
          fuzzySiteData={fuzzySiteData.length > 0 ? fuzzySiteData : undefined}
          onSiteClick={(siteId) => {
            console.log('Clicked site:', siteId);
            // TODO: Focus map on selected site
          }}
        />
      )}
    </div>
  );
}
