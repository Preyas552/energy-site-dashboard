import azure.functions as func
import json
import requests
from typing import Dict, Any


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Azure Function for NASA POWER API proxy"""
    
    try:
        req_body = req.get_json()
        lat = req_body.get('lat')
        lng = req_body.get('lng')
        current_year = req_body.get('current_year')
        historical_years = req_body.get('historical_years')

        if not all([lat, lng, current_year, historical_years]):
            return func.HttpResponse(
                json.dumps({"success": False, "error": "Missing required parameters"}),
                status_code=400,
                mimetype="application/json"
            )

        # Fetch current year data
        current_data = fetch_nasa_power(lat, lng, current_year, current_year)
        
        # Fetch historical data
        start_year = current_year - historical_years
        historical_data = fetch_nasa_power(lat, lng, start_year, current_year - 1)

        # Process data
        result = {
            "success": True,
            "data": {
                "current_year": process_year_data(current_data, current_year),
                "historical_5_years": process_historical_data(historical_data, start_year, current_year - 1)
            }
        }

        return func.HttpResponse(
            json.dumps(result),
            mimetype="application/json"
        )

    except Exception as e:
        return func.HttpResponse(
            json.dumps({"success": False, "error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )


def fetch_nasa_power(lat: float, lng: float, start_year: int, end_year: int) -> Dict[str, Any]:
    """Fetch data from NASA POWER API"""
    params = {
        'parameters': 'ALLSKY_SFC_SW_DWN,ALLSKY_SFC_SW_DNI,ALLSKY_SFC_SW_DIFF',
        'community': 'RE',
        'longitude': str(lng),
        'latitude': str(lat),
        'start': f'{start_year}0101',
        'end': f'{end_year}1231',
        'format': 'JSON'
    }
    
    url = f"https://power.larc.nasa.gov/api/temporal/daily/point"
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()


def process_year_data(data: Dict[str, Any], year: int) -> Dict[str, Any]:
    """Process single year data"""
    ghi = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
    dni = data['properties']['parameter']['ALLSKY_SFC_SW_DNI']
    dhi = data['properties']['parameter']['ALLSKY_SFC_SW_DIFF']

    daily_values = [
        {'date': date, 'ghi': ghi[date], 'dni': dni[date], 'dhi': dhi[date]}
        for date in ghi.keys()
    ]

    valid_ghi = [d['ghi'] for d in daily_values if d['ghi'] > -999]
    valid_dni = [d['dni'] for d in daily_values if d['dni'] > -999]
    valid_dhi = [d['dhi'] for d in daily_values if d['dhi'] > -999]

    return {
        'year': year,
        'daily_values': daily_values,
        'average_ghi': sum(valid_ghi) / len(valid_ghi) if valid_ghi else 0,
        'average_dni': sum(valid_dni) / len(valid_dni) if valid_dni else 0,
        'average_dhi': sum(valid_dhi) / len(valid_dhi) if valid_dhi else 0
    }


def process_historical_data(data: Dict[str, Any], start_year: int, end_year: int) -> Dict[str, Any]:
    """Process historical data"""
    ghi = data['properties']['parameter']['ALLSKY_SFC_SW_DWN']
    dni = data['properties']['parameter']['ALLSKY_SFC_SW_DNI']
    dhi = data['properties']['parameter']['ALLSKY_SFC_SW_DIFF']

    daily_values = [
        {'date': date, 'ghi': ghi[date], 'dni': dni[date], 'dhi': dhi[date]}
        for date in ghi.keys()
    ]

    valid_ghi = [d['ghi'] for d in daily_values if d['ghi'] > -999]
    valid_dni = [d['dni'] for d in daily_values if d['dni'] > -999]
    valid_dhi = [d['dhi'] for d in daily_values if d['dhi'] > -999]

    avg_ghi = sum(valid_ghi) / len(valid_ghi) if valid_ghi else 0
    variance = sum((x - avg_ghi) ** 2 for x in valid_ghi) / len(valid_ghi) if valid_ghi else 0
    std_dev = variance ** 0.5

    return {
        'years': list(range(start_year, end_year + 1)),
        'daily_values': daily_values,
        'average_ghi': avg_ghi,
        'average_dni': sum(valid_dni) / len(valid_dni) if valid_dni else 0,
        'average_dhi': sum(valid_dhi) / len(valid_dhi) if valid_dhi else 0,
        'std_dev': std_dev,
        'min': min(valid_ghi) if valid_ghi else 0,
        'max': max(valid_ghi) if valid_ghi else 0
    }
