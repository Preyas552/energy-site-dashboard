# Azure App Service Deployment Guide

## Overview

Deploy both services to Azure App Service:
- **Python TOPSIS Service** → Azure App Service (Linux, Python)
- **Next.js Application** → Azure App Service (Linux, Node.js)

---

## Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/) ($200 credit)
2. **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
3. **Git** - Your code in a Git repository

---

## Method 1: Azure Portal (GUI - Easiest)

### Part A: Deploy Python TOPSIS Service

#### Step 1: Create App Service for Python

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → **"Web App"**
3. Configure:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new → `energy-site-selector-rg`
   - **Name**: `topsis-service-[yourname]` (must be globally unique)
   - **Publish**: `Code`
   - **Runtime stack**: `Python 3.11`
   - **Operating System**: `Linux`
   - **Region**: Choose closest to you
   - **Pricing Plan**: `Free F1` or `Basic B1` ($13/month)
4. Click **"Review + Create"** → **"Create"**
5. Wait for deployment (2-3 minutes)

#### Step 2: Configure Deployment

1. Go to your new App Service
2. In left menu, click **"Deployment Center"**
3. Choose deployment source:
   - **GitHub**: Connect your GitHub account and select repo
   - **Branch**: `main`
   - **Build Provider**: `App Service Build Service`
4. Click **"Save"**

#### Step 3: Configure Application Settings

1. In left menu, click **"Configuration"**
2. Click **"General settings"** tab
3. Set:
   - **Startup Command**: `gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app`
   - **Stack**: `Python 3.11`
4. Click **"Save"**

#### Step 4: Get the URL

1. In **"Overview"** tab, copy the **URL**
   - Example: `https://topsis-service-yourname.azurewebsites.net`
2. Test it: `https://topsis-service-yourname.azurewebsites.net/health`
   - Should return: `{"status": "healthy"}`

---

### Part B: Deploy Next.js Application

#### Step 1: Create App Service for Node.js

1. Click **"Create a resource"** → **"Web App"**
2. Configure:
   - **Resource Group**: Use existing → `energy-site-selector-rg`
   - **Name**: `energy-site-selector-[yourname]`
   - **Publish**: `Code`
   - **Runtime stack**: `Node 20 LTS`
   - **Operating System**: `Linux`
   - **Region**: Same as Python service
   - **Pricing Plan**: Use same plan as Python service
3. Click **"Review + Create"** → **"Create"**

#### Step 2: Configure Deployment

1. Go to your new App Service
2. **"Deployment Center"** → Connect GitHub
3. Configure:
   - **Repository**: Your repo
   - **Branch**: `main`
   - **Build Provider**: `App Service Build Service`
4. Click **"Save"**

#### Step 3: Configure Environment Variables

1. **"Configuration"** → **"Application settings"**
2. Click **"+ New application setting"** for each:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token |
| `PYTHON_TOPSIS_URL` | `https://topsis-service-yourname.azurewebsites.net` |
| `NASA_POWER_API_URL` | `https://power.larc.nasa.gov/api` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

3. Click **"Save"** → **"Continue"**

#### Step 4: Configure Startup

1. **"Configuration"** → **"General settings"**
2. Set:
   - **Startup Command**: `npm start`
   - **Stack**: `Node 20 LTS`
3. Click **"Save"**

#### Step 5: Access Your App

1. Go to **"Overview"**
2. Click the **URL**: `https://energy-site-selector-yourname.azurewebsites.net`
3. Your app should load! 🎉

---

## Method 2: Azure CLI (Advanced)

### Step 1: Login to Azure

```bash
# Login
az login

# Set subscription (if you have multiple)
az account set --subscription "Your Subscription Name"
```

### Step 2: Create Resource Group

```bash
az group create \
  --name energy-site-selector-rg \
  --location eastus
```

### Step 3: Create App Service Plan

```bash
az appservice plan create \
  --name energy-site-selector-plan \
  --resource-group energy-site-selector-rg \
  --sku B1 \
  --is-linux
```

### Step 4: Deploy Python Service

```bash
# Create web app
az webapp create \
  --resource-group energy-site-selector-rg \
  --plan energy-site-selector-plan \
  --name topsis-service-yourname \
  --runtime "PYTHON:3.11"

# Configure deployment from GitHub
az webapp deployment source config \
  --name topsis-service-yourname \
  --resource-group energy-site-selector-rg \
  --repo-url https://github.com/yourusername/your-repo \
  --branch main \
  --manual-integration

# Set startup command
az webapp config set \
  --name topsis-service-yourname \
  --resource-group energy-site-selector-rg \
  --startup-file "gunicorn --bind=0.0.0.0:\$PORT --timeout 600 app:app"

# Get URL
az webapp show \
  --name topsis-service-yourname \
  --resource-group energy-site-selector-rg \
  --query defaultHostName \
  --output tsv
```

### Step 5: Deploy Next.js App

```bash
# Create web app
az webapp create \
  --resource-group energy-site-selector-rg \
  --plan energy-site-selector-plan \
  --name energy-site-selector-yourname \
  --runtime "NODE:20-lts"

# Configure deployment
az webapp deployment source config \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --repo-url https://github.com/yourusername/your-repo \
  --branch main \
  --manual-integration

# Set environment variables
az webapp config appsettings set \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --settings \
    NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token" \
    PYTHON_TOPSIS_URL="https://topsis-service-yourname.azurewebsites.net" \
    NASA_POWER_API_URL="https://power.larc.nasa.gov/api" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# Set startup command
az webapp config set \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --startup-file "npm start"
```

---

## Method 3: VS Code Extension (Easiest for Developers)

### Step 1: Install Extension

1. Install [Azure App Service extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azureappservice)
2. Sign in to Azure in VS Code

### Step 2: Deploy Python Service

1. Open `topsis-service` folder in VS Code
2. Click Azure icon in sidebar
3. Right-click **"App Services"** → **"Create New Web App"**
4. Follow prompts:
   - Name: `topsis-service-yourname`
   - Runtime: `Python 3.11`
   - Location: Choose region
5. Right-click your new app → **"Deploy to Web App"**
6. Select `topsis-service` folder

### Step 3: Deploy Next.js App

1. Open `energy-site-selector` folder
2. Right-click **"App Services"** → **"Create New Web App"**
3. Follow prompts:
   - Name: `energy-site-selector-yourname`
   - Runtime: `Node 20 LTS`
4. Right-click app → **"Application Settings"** → Add environment variables
5. Right-click app → **"Deploy to Web App"**

---

## Method 4: Azure Container Instances (Docker)

If you prefer Docker:

```bash
# Build and push Python service
az acr create --resource-group energy-site-selector-rg --name yourregistry --sku Basic
az acr build --registry yourregistry --image topsis-service:latest ./topsis-service

# Build and push Next.js
az acr build --registry yourregistry --image nextjs-app:latest ./energy-site-selector

# Deploy containers
az container create \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --image yourregistry.azurecr.io/topsis-service:latest \
  --dns-name-label topsis-service-yourname \
  --ports 5001

az container create \
  --resource-group energy-site-selector-rg \
  --name nextjs-app \
  --image yourregistry.azurecr.io/nextjs-app:latest \
  --dns-name-label energy-site-selector-yourname \
  --ports 3000 \
  --environment-variables \
    NEXT_PUBLIC_MAPBOX_TOKEN="your_token" \
    PYTHON_TOPSIS_URL="http://topsis-service-yourname.eastus.azurecontainer.io:5001"
```

---

## Pricing Comparison

| Tier | Price/Month | CPU | RAM | Best For |
|------|-------------|-----|-----|----------|
| **Free F1** | $0 | Shared | 1 GB | Testing |
| **Basic B1** | ~$13 | 1 core | 1.75 GB | **Recommended** |
| **Standard S1** | ~$70 | 1 core | 1.75 GB | Production |
| **Premium P1v2** | ~$80 | 1 core | 3.5 GB | High traffic |

**Note**: You can run both services on the same App Service Plan (only pay once)

---

## Configuration Files Created

I've created these files for Azure deployment:

- ✅ `topsis-service/startup.sh` - Startup script for Python service
- ✅ `topsis-service/requirements.txt` - Updated with gunicorn
- ✅ `energy-site-selector/.deployment` - Azure deployment config

---

## Monitoring & Logs

### View Logs in Portal

1. Go to your App Service
2. **"Monitoring"** → **"Log stream"**
3. See real-time logs

### View Logs with CLI

```bash
# Python service logs
az webapp log tail \
  --name topsis-service-yourname \
  --resource-group energy-site-selector-rg

# Next.js logs
az webapp log tail \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg
```

### Enable Application Insights (Optional)

```bash
az monitor app-insights component create \
  --app energy-site-selector-insights \
  --location eastus \
  --resource-group energy-site-selector-rg

# Link to web apps
az webapp config appsettings set \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="your-key"
```

---

## Custom Domain (Optional)

### Step 1: Add Custom Domain

```bash
az webapp config hostname add \
  --webapp-name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --hostname www.yourdomain.com
```

### Step 2: Enable HTTPS

```bash
az webapp config ssl bind \
  --name energy-site-selector-yourname \
  --resource-group energy-site-selector-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

Or use **App Service Managed Certificate** (free):
1. Portal → Your App Service
2. **"Custom domains"** → **"Add custom domain"**
3. **"TLS/SSL settings"** → **"Private Key Certificates"**
4. Click **"Create App Service Managed Certificate"**

---

## Troubleshooting

### Python Service Won't Start

```bash
# Check logs
az webapp log tail --name topsis-service-yourname --resource-group energy-site-selector-rg

# Common issues:
# 1. Wrong startup command
# 2. Missing gunicorn in requirements.txt
# 3. Port binding issues

# Fix: Ensure startup command is:
# gunicorn --bind=0.0.0.0:$PORT --timeout 600 app:app
```

### Next.js Build Fails

```bash
# Check build logs in Deployment Center

# Common issues:
# 1. Missing environment variables
# 2. Build timeout (increase in Configuration)
# 3. Memory issues (upgrade to B1 or higher)

# Fix: Add to Application Settings:
# SCM_DO_BUILD_DURING_DEPLOYMENT=true
# WEBSITE_NODE_DEFAULT_VERSION=20-lts
```

### CORS Errors

Already handled in Flask app with `flask-cors`, but if issues persist:

```python
# In app.py, update CORS config:
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://energy-site-selector-yourname.azurewebsites.net"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

---

## Cost Optimization Tips

1. **Use same App Service Plan** for both services (only pay once)
2. **Start with Basic B1** ($13/month for both services)
3. **Use Free F1** for testing (limited to 60 CPU minutes/day)
4. **Enable auto-scaling** only if needed
5. **Stop services** when not in use (dev/test environments)

```bash
# Stop service
az webapp stop --name your-app-name --resource-group energy-site-selector-rg

# Start service
az webapp start --name your-app-name --resource-group energy-site-selector-rg
```

---

## Comparison: Azure vs Other Platforms

| Feature | Azure App Service | Railway | Vercel |
|---------|------------------|---------|--------|
| **Free Tier** | Limited (60 min/day) | 500 hrs/month | Generous |
| **Pricing** | $13/month (B1) | $0-5/month | $0-20/month |
| **Python Support** | ✅ Native | ✅ Native | ❌ Serverless only |
| **Node.js Support** | ✅ Native | ✅ Native | ✅ Optimized |
| **Custom Domain** | ✅ Free SSL | ✅ Free SSL | ✅ Free SSL |
| **Monitoring** | ✅ App Insights | ✅ Basic | ✅ Analytics |
| **Best For** | Enterprise, Azure ecosystem | Startups, quick deploy | Next.js apps |

---

## ✅ Deployment Checklist

- [ ] Created Resource Group
- [ ] Created App Service Plan
- [ ] Deployed Python service
- [ ] Tested Python health endpoint: `/health`
- [ ] Deployed Next.js app
- [ ] Added environment variables
- [ ] Tested Next.js app loads
- [ ] Tested grid selection works
- [ ] Tested "Analyze Sites" works
- [ ] Checked logs for errors
- [ ] (Optional) Added custom domain
- [ ] (Optional) Enabled Application Insights

---

## 🆘 Support Resources

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Azure Free Account](https://azure.microsoft.com/en-us/free/)

---

## Quick Start Commands

```bash
# Complete deployment in one go
az login
az group create --name energy-site-selector-rg --location eastus
az appservice plan create --name energy-site-selector-plan --resource-group energy-site-selector-rg --sku B1 --is-linux

# Deploy Python
az webapp create --resource-group energy-site-selector-rg --plan energy-site-selector-plan --name topsis-service-yourname --runtime "PYTHON:3.11"
az webapp config set --name topsis-service-yourname --resource-group energy-site-selector-rg --startup-file "gunicorn --bind=0.0.0.0:\$PORT --timeout 600 app:app"

# Deploy Next.js
az webapp create --resource-group energy-site-selector-rg --plan energy-site-selector-plan --name energy-site-selector-yourname --runtime "NODE:20-lts"
az webapp config appsettings set --name energy-site-selector-yourname --resource-group energy-site-selector-rg --settings NEXT_PUBLIC_MAPBOX_TOKEN="your_token" PYTHON_TOPSIS_URL="https://topsis-service-yourname.azurewebsites.net"

echo "Deployment complete! Visit: https://energy-site-selector-yourname.azurewebsites.net"
```
