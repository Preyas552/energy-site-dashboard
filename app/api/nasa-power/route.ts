import { NextRequest, NextResponse } from 'next/server';

interface NASAPowerResponse {
  properties: {
    parameter: {
      ALLSKY_SFC_SW_DWN: { [date: string]: number };
      ALLSKY_SFC_SW_DNI: { [date: string]: number };
      ALLSKY_SFC_SW_DIFF: { [date: string]: number };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, current_year, historical_years } = await request.json();

    if (!lat || !lng || !current_year || !historical_years) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch current year data
    const currentData = await fetchNASAPower(lat, lng, current_year, current_year);

    // Fetch historical data (5 years before current year)
    const startYear = current_year - historical_years;
    const historicalData = await fetchNASAPower(lat, lng, startYear, current_year - 1);

    // Process the data
    const processedData = {
      current_year: processYearData(currentData, current_year),
      historical_5_years: processHistoricalData(historicalData, startYear, current_year - 1),
    };

    return NextResponse.json({
      success: true,
      data: processedData,
    });
  } catch (error: any) {
    console.error('NASA POWER API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch solar data',
      },
      { status: 500 }
    );
  }
}

async function fetchNASAPower(
  lat: number,
  lng: number,
  startYear: number,
  endYear: number
): Promise<NASAPowerResponse> {
  const params = new URLSearchParams({
    parameters: 'ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF',
    community: 'RE',
    longitude: lng.toString(),
    latitude: lat.toString(),
    start: `${startYear}0101`,
    end: `${endYear}1231`,
    format: 'JSON',
  });

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`;
  console.log('Fetching NASA POWER data:', url);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`NASA POWER API returned ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function processYearData(data: NASAPowerResponse, year: number) {
  const ghi = data.properties.parameter.ALLSKY_SFC_SW_DWN;
  const dni = data.properties.parameter.ALLSKY_SFC_SW_DNI;
  const dhi = data.properties.parameter.ALLSKY_SFC_SW_DIFF;

  const daily_values = Object.keys(ghi).map((date) => ({
    date,
    ghi: ghi[date],
    dni: dni[date],
    dhi: dhi[date],
  }));

  // Calculate averages (excluding -999 missing values)
  const validGhi = daily_values.filter((d) => d.ghi > -999).map((d) => d.ghi);
  const validDni = daily_values.filter((d) => d.dni > -999).map((d) => d.dni);
  const validDhi = daily_values.filter((d) => d.dhi > -999).map((d) => d.dhi);

  return {
    year,
    daily_values,
    average_ghi: validGhi.reduce((a, b) => a + b, 0) / validGhi.length,
    average_dni: validDni.reduce((a, b) => a + b, 0) / validDni.length,
    average_dhi: validDhi.reduce((a, b) => a + b, 0) / validDhi.length,
  };
}

function processHistoricalData(data: NASAPowerResponse, startYear: number, endYear: number) {
  const ghi = data.properties.parameter.ALLSKY_SFC_SW_DWN;
  const dni = data.properties.parameter.ALLSKY_SFC_SW_DNI;
  const dhi = data.properties.parameter.ALLSKY_SFC_SW_DIFF;

  const daily_values = Object.keys(ghi).map((date) => ({
    date,
    ghi: ghi[date],
    dni: dni[date],
    dhi: dhi[date],
  }));

  // Calculate statistics (excluding -999 missing values)
  const validGhi = daily_values.filter((d) => d.ghi > -999).map((d) => d.ghi);
  const validDni = daily_values.filter((d) => d.dni > -999).map((d) => d.dni);
  const validDhi = daily_values.filter((d) => d.dhi > -999).map((d) => d.dhi);

  const avgGhi = validGhi.reduce((a, b) => a + b, 0) / validGhi.length;
  const avgDni = validDni.reduce((a, b) => a + b, 0) / validDni.length;
  const avgDhi = validDhi.reduce((a, b) => a + b, 0) / validDhi.length;

  // Calculate standard deviation for GHI
  const variance = validGhi.reduce((sum, val) => sum + Math.pow(val - avgGhi, 2), 0) / validGhi.length;
  const stdDev = Math.sqrt(variance);

  const years: number[] = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return {
    years,
    daily_values,
    average_ghi: avgGhi,
    average_dni: avgDni,
    average_dhi: avgDhi,
    std_dev: stdDev,
    min: Math.min(...validGhi),
    max: Math.max(...validGhi),
  };
}
