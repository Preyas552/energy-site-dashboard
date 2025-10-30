// Core type definitions for the application

export interface GridCell {
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

export interface Site {
  id: string;
  cells: GridCell[];
  centroid: {
    lat: number;
    lng: number;
  };
  area_km2: number;
}

export interface GridConfig {
  cellSize: number; // km
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  origin?: {
    lat: number;
    lng: number;
  };
}
