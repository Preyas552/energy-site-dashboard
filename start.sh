#!/bin/bash

# Quick Start Script - Just runs the application
# For Mac and Linux

echo "🚀 Starting Energy Site Selector..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Creating .env file..."
    read -p "Enter your Mapbox token: " MAPBOX_TOKEN
    echo "NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX_TOKEN" > .env
    echo "✓ .env file created"
    echo ""
fi

# Start the application
docker-compose up --build

echo ""
echo "✓ Application started!"
echo "Open: http://localhost:3000"
