// Solar data type definitions

export interface DailyValue {
  date: string; // "YYYYMMDD"
  ghi: number; // Global Horizontal Irradiance (W/m²)
  dni: number; // Direct Normal Irradiance (W/m²)
  dhi: number; // Diffuse Horizontal Irradiance (W/m²)
}

export interface CurrentYearData {
  year: number;
  daily_values: DailyValue[];
  average_ghi: number;
  average_dni: number;
  average_dhi: number;
}

export interface HistoricalData {
  years: number[];
  daily_values: DailyValue[];
  average_ghi: number;
  average_dni: number;
  average_dhi: number;
  std_dev: number;
  min: number;
  max: number;
}

export interface SolarData {
  site_id: string;
  location: {
    lat: number;
    lng: number;
  };
  current_year: CurrentYearData;
  historical_5_years: HistoricalData;
}
