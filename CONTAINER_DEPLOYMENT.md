# Container Deployment Guide

## 🐳 Overview

Your application is now fully containerized with optimized Docker images for both services.

---

## 📦 What's Been Created

### Docker Files
- ✅ `energy-site-selector/Dockerfile` - Optimized Next.js container
- ✅ `topsis-service/Dockerfile` - Optimized Python container
- ✅ `docker-compose.yml` - Development setup
- ✅ `docker-compose.prod.yml` - Production setup with Nginx
- ✅ `nginx.conf` - Reverse proxy configuration
- ✅ `.dockerignore` - Optimize build context

### Kubernetes Files
- ✅ `k8s/topsis-deployment.yaml` - TOPSIS service deployment
- ✅ `k8s/nextjs-deployment.yaml` - Next.js deployment

### Health Checks
- ✅ `energy-site-selector/app/api/health/route.ts` - Health endpoint
- ✅ Both containers have health checks configured

---

## 🚀 Quick Start

### Option 1: Docker Compose (Easiest)

```bash
# Development
docker-compose up --build

# Production
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Access:
- **Next.js**: http://localhost:3000
- **TOPSIS API**: http://localhost:5001
- **Nginx (prod)**: http://localhost

---

## 🔧 Local Development

### Build Individual Containers

```bash
# Build Python TOPSIS service
cd topsis-service
docker build -t topsis-service:latest .

# Build Next.js app
cd energy-site-selector
docker build -t nextjs-app:latest .
```

### Run Individual Containers

```bash
# Run TOPSIS service
docker run -d \
  --name topsis \
  -p 5001:5001 \
  topsis-service:latest

# Run Next.js (with environment variables)
docker run -d \
  --name nextjs \
  -p 3000:3000 \
  -e NEXT_PUBLIC_MAPBOX_TOKEN="your_token" \
  -e PYTHON_TOPSIS_URL="http://topsis:5001" \
  --link topsis:topsis \
  nextjs-app:latest
```

### Test Health Checks

```bash
# Test TOPSIS health
curl http://localhost:5001/health

# Test Next.js health
curl http://localhost:3000/api/health
```

---

## ☁️ Deploy to Azure Container Instances

### Step 1: Create Azure Container Registry

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name energy-site-selector-rg \
  --location eastus

# Create container registry
az acr create \
  --resource-group energy-site-selector-rg \
  --name energyregistry \
  --sku Basic
```

### Step 2: Build and Push Images

```bash
# Login to registry
az acr login --name energyregistry

# Build and push TOPSIS service
az acr build \
  --registry energyregistry \
  --image topsis-service:latest \
  ./topsis-service

# Build and push Next.js app
az acr build \
  --registry energyregistry \
  --image nextjs-app:latest \
  ./energy-site-selector
```

### Step 3: Deploy to Container Instances

```bash
# Get registry credentials
ACR_USERNAME=$(az acr credential show --name energyregistry --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name energyregistry --query passwords[0].value -o tsv)

# Deploy TOPSIS service
az container create \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --image energyregistry.azurecr.io/topsis-service:latest \
  --dns-name-label topsis-yourname \
  --ports 5001 \
  --cpu 1 \
  --memory 1 \
  --registry-login-server energyregistry.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD

# Get TOPSIS URL
TOPSIS_URL=$(az container show \
  --resource-group energy-site-selector-rg \
  --name topsis-service \
  --query ipAddress.fqdn -o tsv)

echo "TOPSIS URL: http://$TOPSIS_URL:5001"

# Deploy Next.js app
az container create \
  --resource-group energy-site-selector-rg \
  --name nextjs-app \
  --image energyregistry.azurecr.io/nextjs-app:latest \
  --dns-name-label energy-site-yourname \
  --ports 3000 \
  --cpu 2 \
  --memory 2 \
  --registry-login-server energyregistry.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --environment-variables \
    NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token" \
    PYTHON_TOPSIS_URL="http://$TOPSIS_URL:5001" \
    NASA_POWER_API_URL="https://power.larc.nasa.gov/api"

# Get Next.js URL
NEXTJS_URL=$(az container show \
  --resource-group energy-site-selector-rg \
  --name nextjs-app \
  --query ipAddress.fqdn -o tsv)

echo "Application URL: http://$NEXTJS_URL:3000"
```

---

## 🎯 Deploy to Azure Container Apps (Recommended)

Azure Container Apps is better than Container Instances for production:
- Auto-scaling
- Better networking
- Ingress management
- Lower cost

```bash
# Create Container Apps environment
az containerapp env create \
  --name energy-env \
  --resource-group energy-site-selector-rg \
  --location eastus

# Deploy TOPSIS service
az containerapp create \
  --name topsis-service \
  --resource-group energy-site-selector-rg \
  --environment energy-env \
  --image energyregistry.azurecr.io/topsis-service:latest \
  --target-port 5001 \
  --ingress internal \
  --registry-server energyregistry.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1 \
  --memory 2Gi \
  --min-replicas 1 \
  --max-replicas 3

# Get TOPSIS internal URL
TOPSIS_FQDN=$(az containerapp show \
  --name topsis-service \
  --resource-group energy-site-selector-rg \
  --query properties.configuration.ingress.fqdn -o tsv)

# Deploy Next.js app
az containerapp create \
  --name nextjs-app \
  --resource-group energy-site-selector-rg \
  --environment energy-env \
  --image energyregistry.azurecr.io/nextjs-app:latest \
  --target-port 3000 \
  --ingress external \
  --registry-server energyregistry.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --env-vars \
    NEXT_PUBLIC_MAPBOX_TOKEN="your_token" \
    PYTHON_TOPSIS_URL="https://$TOPSIS_FQDN" \
    NASA_POWER_API_URL="https://power.larc.nasa.gov/api" \
  --cpu 2 \
  --memory 4Gi \
  --min-replicas 1 \
  --max-replicas 5

# Get application URL
az containerapp show \
  --name nextjs-app \
  --resource-group energy-site-selector-rg \
  --query properties.configuration.ingress.fqdn -o tsv
```

---

## ☸️ Deploy to Kubernetes (AKS)

### Step 1: Create AKS Cluster

```bash
# Create AKS cluster
az aks create \
  --resource-group energy-site-selector-rg \
  --name energy-aks-cluster \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --attach-acr energyregistry \
  --generate-ssh-keys

# Get credentials
az aks get-credentials \
  --resource-group energy-site-selector-rg \
  --name energy-aks-cluster
```

### Step 2: Update Kubernetes Manifests

```bash
# Update image references in k8s/*.yaml files
sed -i 's|your-registry|energyregistry.azurecr.io|g' k8s/*.yaml

# Update Mapbox token in secret
kubectl create secret generic app-secrets \
  --from-literal=mapbox-token="your_mapbox_token"
```

### Step 3: Deploy to Kubernetes

```bash
# Deploy TOPSIS service
kubectl apply -f k8s/topsis-deployment.yaml

# Deploy Next.js app
kubectl apply -f k8s/nextjs-deployment.yaml

# Check status
kubectl get pods
kubectl get services

# Get external IP
kubectl get service nextjs-service
```

---

## 🌐 Deploy to Other Platforms

### Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag topsis-service:latest yourusername/topsis-service:latest
docker tag nextjs-app:latest yourusername/nextjs-app:latest

# Push images
docker push yourusername/topsis-service:latest
docker push yourusername/nextjs-app:latest
```

### AWS ECS (Elastic Container Service)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name topsis-service
aws ecr create-repository --repository-name nextjs-app

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag topsis-service:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/topsis-service:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/topsis-service:latest

# Create ECS cluster and services (use AWS Console or CLI)
```

### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/PROJECT_ID/topsis-service ./topsis-service
gcloud builds submit --tag gcr.io/PROJECT_ID/nextjs-app ./energy-site-selector

# Deploy to Cloud Run
gcloud run deploy topsis-service \
  --image gcr.io/PROJECT_ID/topsis-service \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy nextjs-app \
  --image gcr.io/PROJECT_ID/nextjs-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_MAPBOX_TOKEN=your_token,PYTHON_TOPSIS_URL=https://topsis-service-xxx.run.app
```

---

## 📊 Container Optimization

### Image Sizes

Current optimized sizes:
- **TOPSIS Service**: ~200MB (Python slim + dependencies)
- **Next.js App**: ~150MB (Node Alpine + standalone build)

### Further Optimization

```dockerfile
# Use multi-stage builds (already implemented)
# Use Alpine Linux (already implemented)
# Minimize layers
# Use .dockerignore (already created)
```

### Build Cache

```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t myapp .

# Use cache from registry
docker build --cache-from myregistry/myapp:latest -t myapp .
```

---

## 🔍 Monitoring & Logs

### Docker Compose Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nextjs
docker-compose logs -f topsis

# Last 100 lines
docker-compose logs --tail=100
```

### Azure Container Instances

```bash
# View logs
az container logs \
  --resource-group energy-site-selector-rg \
  --name nextjs-app

# Stream logs
az container logs \
  --resource-group energy-site-selector-rg \
  --name nextjs-app \
  --follow
```

### Kubernetes

```bash
# View logs
kubectl logs -f deployment/nextjs-app
kubectl logs -f deployment/topsis-service

# View all pods
kubectl logs -l app=nextjs-app --all-containers=true
```

---

## 🛠️ Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs container-name

# Inspect container
docker inspect container-name

# Check health
docker ps --filter health=unhealthy
```

### Network Issues

```bash
# Test connectivity between containers
docker exec nextjs ping topsis

# Check network
docker network ls
docker network inspect energy-site-selector-network
```

### Resource Issues

```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

---

## 💰 Cost Comparison

| Platform | Monthly Cost | Scaling | Best For |
|----------|-------------|---------|----------|
| **Docker Compose (VPS)** | $5-10 | Manual | Development |
| **Azure Container Instances** | $30-50 | Manual | Simple apps |
| **Azure Container Apps** | $20-40 | Auto | **Recommended** |
| **Azure AKS** | $70+ | Auto | Enterprise |
| **AWS ECS Fargate** | $30-60 | Auto | AWS ecosystem |
| **Google Cloud Run** | $10-30 | Auto | Serverless |

---

## ✅ Deployment Checklist

- [ ] Built Docker images locally
- [ ] Tested with docker-compose
- [ ] Created container registry
- [ ] Pushed images to registry
- [ ] Deployed containers
- [ ] Configured environment variables
- [ ] Tested health endpoints
- [ ] Verified application works
- [ ] Set up monitoring/logging
- [ ] Configured auto-scaling (if applicable)
- [ ] Set up backup/disaster recovery

---

## 🎯 Recommended Setup

For your application, I recommend:

1. **Development**: Docker Compose locally
2. **Production**: Azure Container Apps
   - Auto-scaling
   - Managed ingress
   - Cost-effective
   - Easy deployment

```bash
# One-command deployment
./deploy-to-azure.sh
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Azure Container Apps](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
