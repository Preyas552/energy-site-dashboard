#!/bin/bash

# Setup script for Python TOPSIS service

echo "Setting up Python TOPSIS service..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the service:"
echo "  source venv/bin/activate"
echo "  python app.py"
