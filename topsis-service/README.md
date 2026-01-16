# Fuzzy TOPSIS Service

Python Flask service for fuzzy TOPSIS multi-criteria decision analysis.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5001`

## API Endpoints

### Health Check
```
GET /health
```

### Analyze Sites
```
POST /api/fuzzy-topsis/analyze
```

Request body:
```json
{
  "alternatives": [
    [
      {"lower": 150, "most_likely": 200, "upper": 250},
      {"lower": 60, "most_likely": 75, "upper": 90}
    ]
  ],
  "weights": [
    {"lower": 0.36, "most_likely": 0.4, "upper": 0.44},
    {"lower": 0.27, "most_likely": 0.3, "upper": 0.33}
  ],
  "criteria_types": [true, true]
}
```

Response:
```json
{
  "success": true,
  "rankings": [
    {
      "alternative_index": 0,
      "closeness_coefficient": 0.85,
      "rank": 1
    }
  ]
}
```
