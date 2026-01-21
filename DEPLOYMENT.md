# Deployment Guide

## Option 1: Vercel + Railway (Recommended - Easiest)

### Step 1: Deploy Python TOPSIS Service to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Configure:
   - **Root Directory**: `topsis-service`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
6. Railway will give you a URL like: `https://your-app.railway.app`

### Step 2: Deploy Next.js App to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project" → Import your repository
4. Configure:
   - **Root Directory**: `energy-site-selector`
   - **Framework Preset**: Next.js
5. Add Environment Variables:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox token
   - `PYTHON_TOPSIS_URL`: Your Railway URL (e.g., `https://your-app.railway.app`)
6. Deploy!

**Cost**: Free tier available for both

---

## Option 2: Docker on Any Platform

### Platforms that support Docker:
- **Render** (Free tier)
- **Fly.io** (Free tier)
- **DigitalOcean App Platform** ($5/month)
- **AWS ECS/Fargate** (Pay as you go)
- **Google Cloud Run** (Free tier)

### Deploy with Docker Compose:

1. **Build and run locally:**
```bash
docker-compose up --build
```

2. **Deploy to platform:**
   - Push to GitHub
   - Connect platform to your repo
   - Platform will detect `docker-compose.yml` and deploy

---

## Option 3: Traditional VPS (DigitalOcean, Linode, AWS EC2)

### Setup on Ubuntu Server:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose

# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Create .env file
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env

# Build and run
docker-compose up -d

# Setup nginx reverse proxy (optional)
sudo apt install nginx
```

**Cost**: $5-10/month

---

## Option 4: Serverless (Advanced)

### Next.js → Vercel (Serverless)
### Python → AWS Lambda + API Gateway

This requires converting the Flask app to Lambda-compatible format.

**Cost**: Pay per request (very cheap for low traffic)

---

## Recommended Setup by Use Case

### 🎓 **Demo/Portfolio Project**
→ **Vercel + Railway** (Free, easy, professional URLs)

### 🏢 **Small Business/Startup**
→ **Vercel + Railway** or **Render** ($0-10/month)

### 🚀 **Production/Scale**
→ **Vercel + AWS Lambda** or **Kubernetes** ($50+/month)

### 💻 **Self-Hosted**
→ **Docker Compose on VPS** ($5-10/month)

---

## Quick Start: Deploy with Docker

```bash
# 1. Set environment variables
export NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# 2. Build and run
docker-compose up -d

# 3. Access application
# Next.js: http://localhost:3000
# TOPSIS API: http://localhost:5001
```

---

## Environment Variables Needed

### Next.js App:
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Your Mapbox API token (required)
- `PYTHON_TOPSIS_URL` - URL of Python service (default: http://localhost:5001)
- `NASA_POWER_API_URL` - NASA POWER API URL (default: https://power.larc.nasa.gov/api)

### Python Service:
- No environment variables required for basic setup

---

## Monitoring & Logs

### Docker Compose:
```bash
# View logs
docker-compose logs -f

# View specific service
docker-compose logs -f nextjs
docker-compose logs -f topsis
```

### Vercel:
- Built-in logs in dashboard
- Real-time function logs

### Railway:
- Built-in logs in dashboard
- Metrics and monitoring included

---

## Troubleshooting

### Issue: TOPSIS service not connecting
**Solution**: Check `PYTHON_TOPSIS_URL` environment variable

### Issue: Map not loading
**Solution**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly

### Issue: NASA POWER API timeout
**Solution**: NASA API can be slow, increase timeout or add retry logic

---

## Cost Estimates

| Platform | Next.js | Python | Total/Month |
|----------|---------|--------|-------------|
| Vercel + Railway | Free | Free | $0 |
| Render | Free | Free | $0 |
| DigitalOcean | $5 | $5 | $10 |
| AWS (small) | $5 | $5 | $10 |
| Vercel + Lambda | Free | $1 | $1 |

**Note**: Free tiers have limitations (bandwidth, compute time, etc.)
