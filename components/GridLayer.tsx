'use client';

import { PolygonLayer } from '@deck.gl/layers';
import { GridCell, Site } from '@/lib/types';
import { getCellPolygon } from '@/lib/gridUtils';

interface GridLayerProps {
  cells: GridCell[];
  sites: Site[];
  results?: any[]; // TOPSIS results
  onCellClick: (cell: GridCell) => void;
}

export function createGridLayer({ cells, sites, results, onCellClick }: GridLayerProps) {
  // Create a map of cell IDs to their site IDs for quick lookup
  const cellToSiteMap = new Map<string, string>();
  sites.forEach((site) => {
    site.cells.forEach((cell) => {
      cellToSiteMap.set(cell.id, site.id);
    });
  });

  // Create a map of site IDs to their ranks
  const siteRankMap = new Map<string, number>();
  if (results) {
    results.forEach((result) => {
      siteRankMap.set(result.site_id, result.rank);
    });
  }

  return new PolygonLayer({
    id: 'grid-layer',
    data: cells,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: (cell: GridCell) => getCellPolygon(cell),
    getFillColor: (cell: GridCell) => {
      if (cell.selected) {
        const siteId = cellToSiteMap.get(cell.id);
        const rank = siteId ? siteRankMap.get(siteId) : undefined;

        // If we have ranking results, color by rank
        if (rank !== undefined) {
          return getRankColor(rank);
        }

        // Otherwise, use green for merged sites (multiple cells)
        const site = sites.find((s) => s.id === siteId);
        if (site && site.cells.length > 1) {
          return [34, 197, 94, 150]; // Green with transparency
        }
        return [59, 130, 246, 150]; // Blue with transparency (single cell)
      }
      return [200, 200, 200, 30]; // Light gray, very transparent
    },
    getLineColor: (cell: GridCell) => {
      if (cell.selected) {
        const siteId = cellToSiteMap.get(cell.id);
        const rank = siteId ? siteRankMap.get(siteId) : undefined;

        // If we have ranking results, use darker version of rank color
        if (rank !== undefined) {
          const color = getRankColor(rank);
          return [color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, 255];
        }

        const site = sites.find((s) => s.id === siteId);
        if (site && site.cells.length > 1) {
          return [22, 163, 74, 255]; // Darker green
        }
        return [37, 99, 235, 255]; // Darker blue
      }
      return [150, 150, 150, 100]; // Gray
    },
    getLineWidth: (cell: GridCell) => {
      if (cell.selected) {
        const siteId = cellToSiteMap.get(cell.id);
        const rank = siteId ? siteRankMap.get(siteId) : undefined;

        // Highlight #1 ranked site with extra thick border
        if (rank === 1) {
          return 5;
        }

        const site = sites.find((s) => s.id === siteId);
        if (site && site.cells.length > 1) {
          return 3; // Thicker border for merged sites
        }
        return 2;
      }
      return 1;
    },
    onClick: (info) => {
      if (info.object) {
        onCellClick(info.object as GridCell);
      }
    },
    updateTriggers: {
      getFillColor: [cells.map((c) => c.selected), sites.length, results?.length],
      getLineColor: [cells.map((c) => c.selected), sites.length, results?.length],
      getLineWidth: [cells.map((c) => c.selected), sites.length, results?.length],
    },
  });
}

// Helper function to get color based on rank
function getRankColor(rank: number): [number, number, number, number] {
  if (rank === 1) return [34, 197, 94, 180]; // Green
  if (rank === 2) return [132, 204, 22, 180]; // Light green
  if (rank === 3) return [234, 179, 8, 180]; // Yellow
  if (rank <= 5) return [249, 115, 22, 180]; // Orange
  return [239, 68, 68, 180]; // Red
}
