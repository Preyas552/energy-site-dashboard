# Azure Backend Hosting Options

## Overview

You can host your backend elements in Azure using multiple services. Here are the best options:

---

## 🎯 Option 1: Azure Functions (Serverless) - RECOMMENDED

**Best for**: API endpoints, event-driven tasks, cost optimization

### Architecture
```
Frontend (Vercel/Azure Static Web Apps)
    ↓
Azure Functions (NASA POWER API, TOPSIS proxy)
    ↓
Azure Container Instances (Python TOPSIS Service)
```

### Advantages
✅ **Pay per execution** (very cheap for low traffic)  
✅ **Auto-scaling** (handles traffic spikes)  
✅ **No server management**  
✅ **Built-in monitoring**  
✅ **Free tier**: 1M executions/month  

### Pricing
- **Free**: 1M requests + 400,000 GB-s compute/month
- **After free tier**: $0.20 per million executions
- **Example**: 10,000 requests/month = FREE

### Deploy Azure Functions

```bash
# Install Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Create Function App
az functionapp create \
  --resource-group energy-site-selector-rg \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --name energy-functions-yourname \
  --storage-account energystorageyourname

# Deploy
cd azure-functions
func azure functionapp publish energy-functions-yourname
```

### Update Next.js to use Azure Functions

```typescript
// In Next.js, update API calls
const NASA_API_URL = 'https://energy-functions-yourname.azurewebsites.net/api/nasa-power';
```

---

## 🐳 Option 2: Azure Container Instances - RECOMMENDED for Python

**Best for**: Python TOPSIS service, Docker containers

### Advantages
✅ **Run Docker containers** without Kubernetes  
✅ **Pay per second** of usage  
✅ **Fast startup** (no cold start)  
✅ **Simple deployment**  

### Pricing
- **1 vCPU + 1GB RAM**: ~$0.0000125/second = ~$32/month (if running 24/7)
- **Can stop when not in use** to save costs

### Deploy Python Service to ACI

```bash
# Build and push to Azure Container Registry
az acr create \
  --resource-group energy-site-selector-rg \
  --name energyregistryyourname \
  --sku Basic

az acr build \
  --registry energyregistryyourname \
  --image topsis-service:latest \
  ./topsis-service

# Deploy to Container Instances
az container create \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --image energyregistryyourname.azurecr.io/topsis-service:latest \
  --dns-name-label topsis-yourname \
  --ports 5001 \
  --cpu 1 \
  --memory 1 \
  --registry-login-server energyregistryyourname.azurecr.io \
  --registry-username $(az acr credential show --name energyregistryyourname --query username -o tsv) \
  --registry-password $(az acr credential show --name energyregistryyourname --query passwords[0].value -o tsv)

# Get URL
echo "http://topsis-yourname.eastus.azurecontainer.io:5001"
```

---

## 🌐 Option 3: Azure API Management

**Best for**: Enterprise, API gateway, rate limiting, caching

### Architecture
```
Frontend
    ↓
Azure API Management (Gateway)
    ↓
Backend Services (Functions, App Service, ACI)
```

### Advantages
✅ **Centralized API gateway**  
✅ **Built-in caching**  
✅ **Rate limiting**  
✅ **API versioning**  
✅ **Analytics & monitoring**  

### Pricing
- **Consumption tier**: $0.035 per 10,000 calls
- **Developer tier**: $50/month
- **Standard tier**: $700/month

### Setup

```bash
# Create API Management instance
az apim create \
  --resource-group energy-site-selector-rg \
  --name energy-apim-yourname \
  --publisher-email your@email.com \
  --publisher-name "Your Name" \
  --sku-name Consumption

# Import APIs
az apim api import \
  --resource-group energy-site-selector-rg \
  --service-name energy-apim-yourname \
  --path /api \
  --specification-format OpenApi \
  --specification-url https://your-backend-url/swagger.json
```

---

## 💾 Option 4: Azure Cosmos DB (Database)

**Best for**: Storing analysis results, user data, caching

### Advantages
✅ **Globally distributed**  
✅ **Low latency**  
✅ **Auto-scaling**  
✅ **Multiple APIs** (SQL, MongoDB, Cassandra)  

### Pricing
- **Free tier**: 1000 RU/s + 25GB storage
- **Serverless**: Pay per request (~$0.25 per million reads)

### Use Cases
- Cache NASA POWER API responses
- Store TOPSIS analysis results
- User preferences and saved sites
- Historical analysis data

### Setup

```bash
# Create Cosmos DB account
az cosmosdb create \
  --resource-group energy-site-selector-rg \
  --name energy-cosmos-yourname \
  --kind GlobalDocumentDB \
  --locations regionName=eastus failoverPriority=0 \
  --default-consistency-level Session

# Create database and container
az cosmosdb sql database create \
  --account-name energy-cosmos-yourname \
  --resource-group energy-site-selector-rg \
  --name energy-site-db

az cosmosdb sql container create \
  --account-name energy-cosmos-yourname \
  --resource-group energy-site-selector-rg \
  --database-name energy-site-db \
  --name analysis-results \
  --partition-key-path "/siteId"
```

---

## 🔄 Option 5: Azure Logic Apps (Workflows)

**Best for**: Orchestrating complex workflows, scheduled tasks

### Use Cases
- Schedule daily NASA POWER data updates
- Send email notifications when analysis completes
- Integrate with other Azure services
- Automate data processing pipelines

### Pricing
- **Consumption**: $0.000025 per action
- **Standard**: $0.80 per connector/month

---

## 📊 Recommended Architecture for Your App

### **Hybrid Approach (Best Cost/Performance)**

```
┌─────────────────────────────────────────────────┐
│  Frontend: Azure Static Web Apps (Free)        │
│  or Vercel ($0-20/month)                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  API Layer: Azure Functions (Serverless)       │
│  - NASA POWER API proxy                         │
│  - Data processing                              │
│  Cost: FREE (under 1M requests/month)           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Compute: Azure Container Instances             │
│  - Python TOPSIS Service                        │
│  Cost: ~$32/month (or stop when not in use)     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  Cache: Azure Cosmos DB (Optional)              │
│  - Cache NASA API responses                     │
│  Cost: FREE tier (1000 RU/s)                    │
└─────────────────────────────────────────────────┘
```

**Total Cost**: $0-32/month (depending on usage)

---

## 🎯 Comparison Table

| Service | Best For | Pricing | Cold Start | Scaling |
|---------|----------|---------|------------|---------|
| **Azure Functions** | API endpoints | Pay per use | Yes (~1s) | Auto |
| **App Service** | Always-on apps | $13+/month | No | Manual/Auto |
| **Container Instances** | Docker apps | $32/month | No | Manual |
| **Container Apps** | Microservices | $0.000012/vCPU-s | No | Auto |
| **Kubernetes (AKS)** | Complex apps | $70+/month | No | Auto |

---

## 💡 My Recommendation for Your App

### **Setup 1: Cost-Optimized (Free-$5/month)**
- Frontend: **Vercel** (Free)
- NASA API: **Azure Functions** (Free tier)
- TOPSIS: **Azure Container Instances** (stop when not in use)
- Cache: **Azure Cosmos DB** (Free tier)

### **Setup 2: Always-On ($45/month)**
- Frontend: **Azure Static Web Apps** ($9/month)
- Backend: **Azure App Service B1** ($13/month)
- TOPSIS: **Azure Container Instances** ($32/month)

### **Setup 3: Enterprise ($100+/month)**
- Frontend: **Azure Static Web Apps** ($9/month)
- API Gateway: **Azure API Management** ($50/month)
- Backend: **Azure Functions** (Premium plan $50/month)
- TOPSIS: **Azure Container Apps** ($20/month)
- Database: **Azure Cosmos DB** ($25/month)

---

## 🚀 Quick Start: Deploy Backend to Azure

### Step 1: Deploy Python TOPSIS to Container Instances

```bash
# Login
az login

# Create resource group
az group create --name energy-site-selector-rg --location eastus

# Create container registry
az acr create --resource-group energy-site-selector-rg --name energyregistry --sku Basic

# Build and push
az acr build --registry energyregistry --image topsis:latest ./topsis-service

# Deploy
az container create \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --image energyregistry.azurecr.io/topsis:latest \
  --dns-name-label topsis-yourname \
  --ports 5001 \
  --cpu 1 --memory 1

# Get URL
az container show \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --query ipAddress.fqdn \
  --output tsv
```

### Step 2: Deploy NASA API to Azure Functions

```bash
# Create storage account
az storage account create \
  --name energystorage \
  --resource-group energy-site-selector-rg \
  --location eastus \
  --sku Standard_LRS

# Create function app
az functionapp create \
  --resource-group energy-site-selector-rg \
  --consumption-plan-location eastus \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4 \
  --name energy-functions \
  --storage-account energystorage

# Deploy
cd azure-functions
func azure functionapp publish energy-functions
```

### Step 3: Update Frontend

```typescript
// Update environment variables
NEXT_PUBLIC_NASA_API_URL=https://energy-functions.azurewebsites.net/api/nasa-power
PYTHON_TOPSIS_URL=http://topsis-yourname.eastus.azurecontainer.io:5001
```

---

## 📈 Monitoring & Optimization

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app energy-insights \
  --location eastus \
  --resource-group energy-site-selector-rg

# Link to Function App
az functionapp config appsettings set \
  --name energy-functions \
  --resource-group energy-site-selector-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key"
```

### Cost Management

```bash
# Set budget alert
az consumption budget create \
  --amount 50 \
  --budget-name energy-site-budget \
  --category Cost \
  --time-grain Monthly \
  --time-period start-date=2024-01-01 \
  --resource-group energy-site-selector-rg
```

---

## ✅ Summary

**Yes, you can absolutely host backend elements in Azure!**

Best approach for your app:
1. **Python TOPSIS** → Azure Container Instances ($32/month or stop when not in use)
2. **NASA API proxy** → Azure Functions (FREE under 1M requests)
3. **Frontend** → Vercel (FREE) or Azure Static Web Apps ($9/month)
4. **Optional Cache** → Azure Cosmos DB (FREE tier)

**Total Cost**: $0-40/month depending on usage

I've created Azure Functions code for the NASA POWER API in the `azure-functions/` directory!
