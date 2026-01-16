#!/bin/bash

# Test script for Lambda function
# Usage: ./test-lambda.sh YOUR_LAMBDA_URL

if [ -z "$1" ]; then
    echo "Usage: ./test-lambda.sh YOUR_LAMBDA_URL"
    echo "Example: ./test-lambda.sh https://abc123.lambda-url.us-east-1.on.aws"
    exit 1
fi

LAMBDA_URL=$1

echo "Testing Lambda Function: $LAMBDA_URL"
echo ""

echo "Test 1: Health Check"
echo "===================="
curl -s "${LAMBDA_URL}/health" | jq .
echo ""
echo ""

echo "Test 2: Fuzzy TOPSIS Analyze"
echo "============================="
curl -s -X POST "${LAMBDA_URL}/api/fuzzy-topsis/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "alternatives": [
      [
        {"lower": 5.0, "most_likely": 6.0, "upper": 7.0},
        {"lower": 7.0, "most_likely": 8.0, "upper": 9.0},
        {"lower": 2.0, "most_likely": 3.0, "upper": 4.0},
        {"lower": 3.0, "most_likely": 4.0, "upper": 5.0}
      ],
      [
        {"lower": 6.0, "most_likely": 7.0, "upper": 8.0},
        {"lower": 6.0, "most_likely": 7.0, "upper": 8.0},
        {"lower": 3.0, "most_likely": 4.0, "upper": 5.0},
        {"lower": 4.0, "most_likely": 5.0, "upper": 6.0}
      ]
    ],
    "weights": [
      {"lower": 0.36, "most_likely": 0.4, "upper": 0.44},
      {"lower": 0.27, "most_likely": 0.3, "upper": 0.33},
      {"lower": 0.18, "most_likely": 0.2, "upper": 0.22},
      {"lower": 0.09, "most_likely": 0.1, "upper": 0.11}
    ],
    "criteria_types": [true, true, false, false]
  }' | jq .

echo ""
echo ""
echo "Done!"
