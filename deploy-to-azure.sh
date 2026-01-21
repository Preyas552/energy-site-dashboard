#!/bin/bash

# Azure Container Apps Deployment Script
# Usage: ./deploy-to-azure.sh

set -e

# Configuration
RESOURCE_GROUP="energy-site-selector-rg"
LOCATION="eastus"
REGISTRY_NAME="energyregistry"
ENV_NAME="energy-env"
TOPSIS_APP="topsis-service"
NEXTJS_APP="nextjs-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to Azure Container Apps${NC}"

# Check if logged in
echo -e "${YELLOW}Checking Azure login...${NC}"
az account show > /dev/null 2>&1 || {
    echo -e "${RED}Not logged in to Azure. Please run 'az login'${NC}"
    exit 1
}

# Prompt for Mapbox token
read -p "Enter your Mapbox token: " MAPBOX_TOKEN

# Create resource group
echo -e "${YELLOW}Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create container registry
echo -e "${YELLOW}Creating container registry...${NC}"
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic \
  --admin-enabled true

# Get registry credentials
echo -e "${YELLOW}Getting registry credentials...${NC}"
ACR_USERNAME=$(az acr credential show --name $REGISTRY_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $REGISTRY_NAME --query passwords[0].value -o tsv)

# Build and push TOPSIS service
echo -e "${YELLOW}Building and pushing TOPSIS service...${NC}"
az acr build \
  --registry $REGISTRY_NAME \
  --image topsis-service:latest \
  ./topsis-service

# Build and push Next.js app
echo -e "${YELLOW}Building and pushing Next.js app...${NC}"
az acr build \
  --registry $REGISTRY_NAME \
  --image nextjs-app:latest \
  ./energy-site-selector

# Create Container Apps environment
echo -e "${YELLOW}Creating Container Apps environment...${NC}"
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy TOPSIS service
echo -e "${YELLOW}Deploying TOPSIS service...${NC}"
az containerapp create \
  --name $TOPSIS_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $REGISTRY_NAME.azurecr.io/topsis-service:latest \
  --target-port 5001 \
  --ingress internal \
  --registry-server $REGISTRY_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1 \
  --memory 2Gi \
  --min-replicas 1 \
  --max-replicas 3

# Get TOPSIS internal URL
TOPSIS_FQDN=$(az containerapp show \
  --name $TOPSIS_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}TOPSIS service deployed at: https://$TOPSIS_FQDN${NC}"

# Deploy Next.js app
echo -e "${YELLOW}Deploying Next.js app...${NC}"
az containerapp create \
  --name $NEXTJS_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $REGISTRY_NAME.azurecr.io/nextjs-app:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server $REGISTRY_NAME.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --env-vars \
    NEXT_PUBLIC_MAPBOX_TOKEN="$MAPBOX_TOKEN" \
    PYTHON_TOPSIS_URL="https://$TOPSIS_FQDN" \
    NASA_POWER_API_URL="https://power.larc.nasa.gov/api" \
  --cpu 2 \
  --memory 4Gi \
  --min-replicas 1 \
  --max-replicas 5

# Get application URL
APP_URL=$(az containerapp show \
  --name $NEXTJS_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn -o tsv)

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Application URL: https://$APP_URL${NC}"
echo -e "${YELLOW}📊 View logs: az containerapp logs show --name $NEXTJS_APP --resource-group $RESOURCE_GROUP --follow${NC}"
