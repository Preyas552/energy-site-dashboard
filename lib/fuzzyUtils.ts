import { FuzzyNumber, FuzzySiteData } from './fuzzyTypes';
import { SolarData } from './solarTypes';
import { calculateConfidence } from './solarDataUtils';

/**
 * Generate a triangular fuzzy number from historical data
 * Uses statistical approach: mean ± std_dev for bounds
 */
export function generateFuzzyFromHistorical(
  currentYearAvg: number,
  historicalMean: number,
  historicalStdDev: number
): FuzzyNumber {
  return {
    lower: Math.max(0, historicalMean - historicalStdDev), // Pessimistic
    most_likely: currentYearAvg, // Expected (current year)
    upper: historicalMean + historicalStdDev, // Optimistic
  };
}

/**
 * Generate fuzzy number for solar potential (GHI)
 */
export function generateSolarPotentialFuzzy(solarData: SolarData): FuzzyNumber {
  return generateFuzzyFromHistorical(
    solarData.current_year.average_ghi,
    solarData.historical_5_years.average_ghi,
    solarData.historical_5_years.std_dev
  );
}

/**
 * Generate fuzzy number for land suitability
 * Based on location characteristics (simplified for now)
 */
export function generateLandSuitabilityFuzzy(solarData: SolarData): FuzzyNumber {
  // Simplified: vary based on latitude (more variation for TOPSIS)
  // In a real system, this would consider terrain, land use, etc.
  const latVariation = (solarData.location.lat % 1) * 20; // 0-20 variation based on latitude
  const baseSuitability = 70 + latVariation; // 70-90 scale
  const uncertainty = 10;

  return {
    lower: Math.max(0, baseSuitability - uncertainty),
    most_likely: baseSuitability,
    upper: Math.min(100, baseSuitability + uncertainty),
  };
}

/**
 * Generate fuzzy number for grid proximity
 * Simplified: estimate based on location (urban vs rural)
 */
export function generateGridProximityFuzzy(solarData: SolarData): FuzzyNumber {
  // Simplified: vary based on longitude (more variation for TOPSIS)
  // In a real system, this would use actual grid infrastructure data
  const lngVariation = Math.abs(solarData.location.lng % 1) * 10; // 0-10 variation
  const baseDistance = 3 + lngVariation; // 3-13 km
  const uncertainty = 2;

  return {
    lower: Math.max(0.5, baseDistance - uncertainty),
    most_likely: baseDistance,
    upper: baseDistance + uncertainty,
  };
}

/**
 * Generate fuzzy number for installation cost
 * Based on solar potential and location
 */
export function generateInstallationCostFuzzy(solarData: SolarData): FuzzyNumber {
  // Simplified cost model: $/kW
  // Better solar potential = lower cost per kW (more efficient)
  // Add variation based on solar potential
  const solarFactor = solarData.current_year.average_ghi / 200; // Normalize
  const baseCost = 1200 + (1 - solarFactor) * 500; // 1200-1700 $/kW
  const uncertainty = 200;

  return {
    lower: Math.max(1000, baseCost - uncertainty),
    most_likely: baseCost,
    upper: baseCost + uncertainty,
  };
}

/**
 * Generate complete fuzzy site data from solar data
 */
export function generateFuzzySiteData(solarData: SolarData): FuzzySiteData {
  const confidence = calculateConfidence(
    solarData.historical_5_years,
    solarData.current_year
  );

  return {
    site_id: solarData.site_id,
    location: solarData.location,
    criteria: {
      solar_potential: generateSolarPotentialFuzzy(solarData),
      land_suitability: generateLandSuitabilityFuzzy(solarData),
      grid_proximity: generateGridProximityFuzzy(solarData),
      installation_cost: generateInstallationCostFuzzy(solarData),
    },
    metadata: {
      historical_years: solarData.historical_5_years.years.length,
      current_year_days: solarData.current_year.daily_values.length,
      confidence,
    },
  };
}

/**
 * Generate fuzzy site data for multiple sites
 */
export function generateFuzzySiteDataForAll(solarDataArray: SolarData[]): FuzzySiteData[] {
  return solarDataArray.map((solarData) => generateFuzzySiteData(solarData));
}
