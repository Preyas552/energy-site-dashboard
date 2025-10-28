import { GridCell, GridConfig } from './types';

/**
 * Convert kilometers to degrees latitude
 * 1 degree latitude ≈ 111 km
 */
export function kmToLatDegrees(km: number): number {
  return km / 111;
}

/**
 * Convert kilometers to degrees longitude at a given latitude
 * Longitude degrees vary by latitude due to Earth's curvature
 */
export function kmToLngDegrees(km: number, latitude: number): number {
  return km / (111 * Math.cos((latitude * Math.PI) / 180));
}

/**
 * Generate grid cells based on configuration
 * Creates a grid of cells covering the specified bounds
 */
export function generateGrid(config: GridConfig): GridCell[] {
  const cells: GridCell[] = [];
  const { cellSize, bounds } = config;

  // Convert km to degrees
  const latStep = kmToLatDegrees(cellSize);
  
  // Use the center latitude for longitude calculation
  const centerLat = (bounds.north + bounds.south) / 2;
  const lngStep = kmToLngDegrees(cellSize, centerLat);

  // Generate cells
  for (let lat = bounds.south; lat < bounds.north; lat += latStep) {
    for (let lng = bounds.west; lng < bounds.east; lng += lngStep) {
      const cellLat = lat + latStep / 2;
      const cellLng = lng + lngStep / 2;

      cells.push({
        id: `cell_${cellLat.toFixed(4)}_${cellLng.toFixed(4)}`,
        lat: cellLat,
        lng: cellLng,
        bounds: {
          north: lat + latStep,
          south: lat,
          east: lng + lngStep,
          west: lng,
        },
        selected: false,
      });
    }
  }

  return cells;
}

/**
 * Get the bounds of a cell as a polygon (for rendering)
 */
export function getCellPolygon(cell: GridCell): number[][] {
  const { bounds } = cell;
  return [
    [bounds.west, bounds.south],
    [bounds.east, bounds.south],
    [bounds.east, bounds.north],
    [bounds.west, bounds.north],
    [bounds.west, bounds.south], // Close the polygon
  ];
}

/**
 * Check if a point is inside a cell
 */
export function isPointInCell(lat: number, lng: number, cell: GridCell): boolean {
  const { bounds } = cell;
  return (
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

/**
 * Check if two cells are adjacent (share an edge)
 * Cells are adjacent if they share a vertical or horizontal edge
 */
export function areAdjacent(cell1: GridCell, cell2: GridCell): boolean {
  const latDiff = Math.abs(cell1.lat - cell2.lat);
  const lngDiff = Math.abs(cell1.lng - cell2.lng);

  // Calculate approximate cell size from bounds
  const cellSizeLat = cell1.bounds.north - cell1.bounds.south;
  const cellSizeLng = cell1.bounds.east - cell1.bounds.west;

  // 10% tolerance for floating-point comparison
  const toleranceLat = cellSizeLat * 0.1;
  const toleranceLng = cellSizeLng * 0.1;

  // Cells are adjacent if they share an edge:
  // - Vertical neighbors: same longitude, adjacent latitude
  const verticalNeighbors =
    latDiff >= cellSizeLat - toleranceLat &&
    latDiff <= cellSizeLat + toleranceLat &&
    lngDiff < toleranceLng;

  // - Horizontal neighbors: same latitude, adjacent longitude
  const horizontalNeighbors =
    lngDiff >= cellSizeLng - toleranceLng &&
    lngDiff <= cellSizeLng + toleranceLng &&
    latDiff < toleranceLat;

  return verticalNeighbors || horizontalNeighbors;
}

/**
 * Calculate the centroid (center point) of a group of cells
 */
export function calculateCentroid(cells: GridCell[]): { lat: number; lng: number } {
  if (cells.length === 0) {
    throw new Error('Cannot calculate centroid of empty cell array');
  }

  const sumLat = cells.reduce((sum, cell) => sum + cell.lat, 0);
  const sumLng = cells.reduce((sum, cell) => sum + cell.lng, 0);

  return {
    lat: sumLat / cells.length,
    lng: sumLng / cells.length,
  };
}

/**
 * Merge adjacent selected cells into sites using BFS
 * Returns an array of sites, each containing connected cells
 */
export function mergeCells(selectedCells: GridCell[]): import('./types').Site[] {
  const sites: import('./types').Site[] = [];
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
    const centroid = calculateCentroid(connectedCells);
    
    // Calculate area (assuming each cell is approximately 1 km²)
    const cellSizeLat = connectedCells[0].bounds.north - connectedCells[0].bounds.south;
    const cellSizeLng = connectedCells[0].bounds.east - connectedCells[0].bounds.west;
    const avgLat = centroid.lat;
    
    // Convert to km²
    const cellAreaKm2 = 
      (cellSizeLat * 111) * 
      (cellSizeLng * 111 * Math.cos((avgLat * Math.PI) / 180));
    
    sites.push({
      id: `site_${sites.length + 1}`,
      cells: connectedCells,
      centroid,
      area_km2: connectedCells.length * cellAreaKm2,
    });
  }

  return sites;
}
