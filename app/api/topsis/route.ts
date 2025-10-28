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

    // Transform fuzzy site data to Python service format
    const alternatives = sites.map((site: FuzzySiteData) => [
      site.criteria.solar_potential,
      site.criteria.land_suitability,
      site.criteria.grid_proximity,
      site.criteria.installation_cost,
    ]);

    // Create fuzzy weights (with 10% uncertainty)
    const fuzzyWeights = [
      {
        lower: weights.solar_potential * 0.9,
        most_likely: weights.solar_potential,
        upper: weights.solar_potential * 1.1,
      },
      {
        lower: weights.land_suitability * 0.9,
        most_likely: weights.land_suitability,
        upper: weights.land_suitability * 1.1,
      },
      {
        lower: weights.grid_proximity * 0.9,
        most_likely: weights.grid_proximity,
        upper: weights.grid_proximity * 1.1,
      },
      {
        lower: weights.installation_cost * 0.9,
        most_likely: weights.installation_cost,
        upper: weights.installation_cost * 1.1,
      },
    ];

    // Criteria types: true = benefit (higher is better), false = cost (lower is better)
    const criteriaTypes = [
      true, // solar_potential (benefit)
      true, // land_suitability (benefit)
      false, // grid_proximity (cost - closer is better)
      false, // installation_cost (cost - lower is better)
    ];

    console.log('Sending to Python TOPSIS service:', PYTHON_SERVICE_URL);
    console.log('Number of alternatives:', alternatives.length);
    console.log('Sample alternative:', alternatives[0]);
    console.log('Weights:', fuzzyWeights);

    // Call Python TOPSIS service
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/fuzzy-topsis/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        alternatives,
        weights: fuzzyWeights,
        criteria_types: criteriaTypes,
      }),
    });

    if (!response.ok) {
      throw new Error(`Python service returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'TOPSIS analysis failed');
    }

    console.log('Python TOPSIS response:', result);

    // Transform Python response to our format
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
    console.error('TOPSIS API error:', error);
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
