#!/bin/bash

# Azure App Service startup script for Python
echo "Starting TOPSIS service..."

# Install dependencies
pip install -r requirements.txt

# Start the application
gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app
