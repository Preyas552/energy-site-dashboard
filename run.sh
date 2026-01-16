#!/bin/bash

# Energy Site Selector - Run Script
# For Mac and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  Energy Site Selector${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo -e "${YELLOW}Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo -e "${YELLOW}Please start Docker Desktop and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo ""
    echo "Please create a .env file with your Mapbox token:"
    echo ""
    read -p "Enter your Mapbox token (or press Enter to skip): " MAPBOX_TOKEN
    
    if [ -z "$MAPBOX_TOKEN" ]; then
        echo -e "${YELLOW}Creating .env file with placeholder...${NC}"
        echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here" > .env
        echo ""
        echo -e "${YELLOW}⚠️  Please edit .env file and add your Mapbox token before running again!${NC}"
        echo "Get your token at: https://account.mapbox.com/access-tokens/"
        exit 1
    else
        echo "NEXT_PUBLIC_MAPBOX_TOKEN=$MAPBOX_TOKEN" > .env
        echo -e "${GREEN}✓ .env file created${NC}"
    fi
fi

echo -e "${GREEN}✓ .env file exists${NC}"
echo ""

# Ask user what to do
echo "What would you like to do?"
echo ""
echo "1) Start the application (first time - will build)"
echo "2) Start the application (quick start)"
echo "3) Stop the application"
echo "4) View logs"
echo "5) Restart the application"
echo "6) Clean restart (rebuild everything)"
echo "7) Exit"
echo ""
read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Starting application (building images)...${NC}"
        echo -e "${YELLOW}This may take 5-10 minutes on first run...${NC}"
        echo ""
        docker-compose up --build
        ;;
    2)
        echo ""
        echo -e "${BLUE}🚀 Starting application...${NC}"
        echo ""
        docker-compose up
        ;;
    3)
        echo ""
        echo -e "${YELLOW}🛑 Stopping application...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ Application stopped${NC}"
        ;;
    4)
        echo ""
        echo -e "${BLUE}📋 Viewing logs (press Ctrl+C to exit)...${NC}"
        echo ""
        docker-compose logs -f
        ;;
    5)
        echo ""
        echo -e "${YELLOW}🔄 Restarting application...${NC}"
        docker-compose restart
        echo -e "${GREEN}✓ Application restarted${NC}"
        echo ""
        echo -e "${GREEN}Open: http://localhost:3000${NC}"
        ;;
    6)
        echo ""
        echo -e "${YELLOW}🧹 Cleaning and rebuilding...${NC}"
        docker-compose down -v
        echo ""
        echo -e "${BLUE}🚀 Building and starting...${NC}"
        docker-compose up --build
        ;;
    7)
        echo ""
        echo -e "${GREEN}👋 Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# If we started the app, show the URL
if [ "$choice" = "1" ] || [ "$choice" = "2" ]; then
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}✓ Application is running!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${BLUE}Open in your browser:${NC}"
    echo -e "${GREEN}http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
fi
