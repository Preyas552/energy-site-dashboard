#!/bin/bash

# Local Development Start Script (without Docker)
# For Mac and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Energy Site Selector (Local)${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 is installed${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"

# Check if .env file exists
if [ ! -f energy-site-selector/.env ]; then
    echo -e "${YELLOW}⚠️  .env file not found in energy-site-selector/!${NC}"
    echo ""
    read -p "Enter your Mapbox token: " MAPBOX_TOKEN
    echo "NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX_TOKEN" > energy-site-selector/.env
    echo -e "${GREEN}✓ .env file created${NC}"
fi

echo ""
echo -e "${BLUE}📦 Setting up Python TOPSIS service...${NC}"

# Navigate to topsis-service
cd topsis-service

# Check if venv exists, create if not
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install requirements
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt

echo -e "${GREEN}✓ Python service ready${NC}"
echo ""

# Start Python service in background
echo -e "${BLUE}🚀 Starting Python TOPSIS service on port 5001...${NC}"
python app.py &
PYTHON_PID=$!
echo -e "${GREEN}✓ Python service started (PID: $PYTHON_PID)${NC}"

# Go back to root
cd ..

echo ""
echo -e "${BLUE}📦 Setting up Next.js frontend...${NC}"

# Navigate to energy-site-selector
cd energy-site-selector

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ npm dependencies installed${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting Next.js development server on port 3000...${NC}"
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Services are starting!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "${BLUE}Backend:  ${GREEN}http://localhost:5001${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start Next.js (this will run in foreground)
npm run dev

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $PYTHON_PID 2>/dev/null
    echo -e "${GREEN}✓ Services stopped${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

