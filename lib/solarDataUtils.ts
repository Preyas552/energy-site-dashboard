import { SolarData, CurrentYearData, HistoricalData } from './solarTypes';
import { Site } from './types';

/**
 * Fetch solar data for a specific site
 */
export async function fetchSolarDataForSite(
  site: Site,
  currentYear: number = new Date().getFullYear()
): Promise<SolarData> {
  const response = await fetch('/api/nasa-power', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lat: site.centroid.lat,
      lng: site.centroid.lng,
      current_year: currentYear,
      historical_years: 5,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch solar data');
  }

  const result = await response.json();

  return {
    site_id: site.id,
    location: site.centroid,
    current_year: result.data.current_year,
    historical_5_years: result.data.historical_5_years,
  };
}

/**
 * Fetch solar data for multiple sites in parallel
 */
export async function fetchSolarDataForAllSites(
  sites: Site[],
  onProgress?: (current: number, total: number) => void
): Promise<SolarData[]> {
  const results: SolarData[] = [];
  const errors: { site: Site; error: Error }[] = [];

  for (let i = 0; i < sites.length; i++) {
    try {
      if (onProgress) {
        onProgress(i + 1, sites.length);
      }
      const data = await fetchSolarDataForSite(sites[i]);
      results.push(data);
    } catch (error) {
      console.error(`Failed to fetch data for site ${sites[i].id}:`, error);
      errors.push({ site: sites[i], error: error as Error });
    }
  }

  if (errors.length > 0) {
    console.warn(`Failed to fetch data for ${errors.length} sites`);
  }

  return results;
}

/**
 * Calculate confidence score based on data quality
 */
export function calculateConfidence(
  historical: HistoricalData,
  current: CurrentYearData
): number {
  // Factor 1: Sample size (more years = higher confidence)
  const sampleFactor = Math.min(historical.years.length / 5, 1.0);

  // Factor 2: Data consistency (lower coefficient of variation = higher confidence)
  const coefficientOfVariation = historical.std_dev / historical.average_ghi;
  const consistencyFactor = Math.max(0, 1 - coefficientOfVariation);

  // Factor 3: Current year alignment with historical
  const deviation = Math.abs(current.average_ghi - historical.average_ghi);
  const alignmentFactor = Math.max(0, 1 - deviation / historical.average_ghi);

  // Weighted combination
  return sampleFactor * 0.3 + consistencyFactor * 0.4 + alignmentFactor * 0.3;
}
