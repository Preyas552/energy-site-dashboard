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
 * Based on solar potential (better solar = better land for solar)
 */
export function generateLandSuitabilityFuzzy(solarData: SolarData): FuzzyNumber {
  // Use solar potential as a proxy for land suitability
  // Better solar irradiance suggests better conditions overall
  const solarScore = solarData.current_year.average_ghi;
  
  // Normalize to 0-100 scale (typical GHI range: 100-250 W/m²)
  const normalizedScore = Math.min(100, Math.max(0, ((solarScore - 100) / 150) * 100));
  
  // Add small random variation (±5) to differentiate nearby sites
  const randomVariation = (Math.random() - 0.5) * 10;
  const baseSuitability = Math.max(50, Math.min(95, normalizedScore + randomVariation));
  const uncertainty = 8;

  return {
    lower: Math.max(0, baseSuitability - uncertainty),
    most_likely: baseSuitability,
    upper: Math.min(100, baseSuitability + uncertainty),
  };
}

/**
 * Generate fuzzy number for grid proximity
 * Estimate based on location (simplified - assumes similar distance in same area)
 */
export function generateGridProximityFuzzy(solarData: SolarData): FuzzyNumber {
  // In the same geographic area, grid proximity should be similar
  // Add small random variation (±1 km) to differentiate sites
  const randomVariation = (Math.random() - 0.5) * 2;
  const baseDistance = 5 + randomVariation; // 4-6 km typical
  const uncertainty = 1.5;

  return {
    lower: Math.max(0.5, baseDistance - uncertainty),
    most_likely: baseDistance,
    upper: baseDistance + uncertainty,
  };
}

/**
 * Generate fuzzy number for installation cost
 * Based on solar potential (better solar = slightly lower cost per kW)
 */
export function generateInstallationCostFuzzy(solarData: SolarData): FuzzyNumber {
  // Better solar potential = slightly lower cost per kW (more efficient ROI)
  const solarScore = solarData.current_year.average_ghi;
  
  // Base cost around $1400-1600/kW
  // Better solar (higher GHI) = slightly lower cost
  const solarFactor = Math.max(0, Math.min(1, (solarScore - 100) / 150));
  const baseCost = 1600 - (solarFactor * 200); // 1400-1600 $/kW
  
  // Add small random variation (±50) for site-specific factors
  const randomVariation = (Math.random() - 0.5) * 100;
  const finalCost = baseCost + randomVariation;
  const uncertainty = 150;

  return {
    lower: Math.max(1000, finalCost - uncertainty),
    most_likely: finalCost,
    upper: finalCost + uncertainty,
  };
}

/**
 * Generate complete fuzzy site data from solar data
 * 
 * NOTE: Sites in the same geographic area will have similar scores because:
 * - Solar potential is based on real NASA data (similar in same area)
 * - Other criteria use solar data as a proxy
 * - Small random variations help differentiate nearby sites
 * 
 * In a production system, you would use:
 * - Actual terrain/land use data for land suitability
 * - Real power grid infrastructure data for grid proximity
 * - Detailed cost estimates based on site-specific factors
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
