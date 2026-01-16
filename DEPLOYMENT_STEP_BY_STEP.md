# Step-by-Step Deployment Guide

## 🚀 Method 1: Railway + Vercel (Recommended)

### Part A: Deploy Python Service to Railway

#### Step 1: Prepare Your Code
```bash
# Make sure you're in the project root
cd /path/to/your/project

# Commit all changes
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will ask which service to deploy:
   - Click **"Add variables"** (optional, none needed for basic setup)
   - Railway will auto-detect Python and install dependencies
6. **Important**: Railway will give you a URL like:
   ```
   https://topsis-service-production-xxxx.up.railway.app
   ```
   **Copy this URL!** You'll need it for Vercel.

#### Step 3: Configure Railway (if needed)
- Railway auto-detects `requirements.txt` and runs `python app.py`
- The service will run on the port Railway provides (handled automatically)
- Check logs to ensure it's running: Look for "Running on http://0.0.0.0:XXXX"

---

### Part B: Deploy Next.js to Vercel

#### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `energy-site-selector`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)

#### Step 2: Add Environment Variables
Click **"Environment Variables"** and add:

| Name | Value | Example |
|------|-------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Your Mapbox token | `pk.eyJ1Ijoi...` |
| `PYTHON_TOPSIS_URL` | Your Railway URL | `https://topsis-service-production-xxxx.up.railway.app` |

#### Step 3: Deploy
- Click **"Deploy"**
- Wait 2-3 minutes
- Vercel will give you a URL like: `https://your-app.vercel.app`

#### Step 4: Test
- Visit your Vercel URL
- Select some grid cells
- Click "Analyze Sites"
- Should work! 🎉

---

## 🐳 Method 2: Docker on Render (Free Alternative)

### Step 1: Deploy Python Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `topsis-service`
   - **Root Directory**: `topsis-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: `Free`
5. Click **"Create Web Service"**
6. Copy the URL: `https://topsis-service.onrender.com`

### Step 2: Deploy Next.js

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `energy-site-selector`
   - **Root Directory**: `energy-site-selector`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Add Environment Variables:
   - `NEXT_PUBLIC_MAPBOX_TOKEN`: Your Mapbox token
   - `PYTHON_TOPSIS_URL`: Your Render Python service URL
5. Click **"Create Web Service"**

**Note**: Render free tier spins down after inactivity (takes 30s to wake up)

---

## 🖥️ Method 3: Docker Compose on VPS

### Step 1: Get a VPS
- DigitalOcean Droplet ($6/month)
- Linode ($5/month)
- AWS EC2 t2.micro (Free tier)
- Hetzner ($4/month)

### Step 2: Setup Server
```bash
# SSH into your server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt update
sudo apt install docker-compose -y

# Clone your repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo
```

### Step 3: Configure Environment
```bash
# Create .env file
nano .env

# Add this content:
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### Step 4: Run with Docker Compose
```bash
# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Services will be available at:
# Next.js: http://your-server-ip:3000
# Python: http://your-server-ip:5001
```

### Step 5: Setup Domain (Optional)
```bash
# Install nginx
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/energy-site-selector

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/energy-site-selector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL (optional)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Method 4: Separate Hosting (Mix & Match)

You can mix different platforms:

### Python Service Options:
1. **Railway** (easiest, free)
2. **Render** (free, slower cold starts)
3. **Heroku** ($7/month, no free tier anymore)
4. **AWS Lambda** (serverless, pay per request)
5. **Google Cloud Run** (serverless, free tier)
6. **DigitalOcean App Platform** ($5/month)

### Next.js Options:
1. **Vercel** (best for Next.js, free)
2. **Netlify** (free, good alternative)
3. **Cloudflare Pages** (free, fast)
4. **AWS Amplify** (pay as you go)

---

## 📊 Comparison Table

| Method | Cost | Difficulty | Cold Start | Best For |
|--------|------|------------|------------|----------|
| Railway + Vercel | Free | ⭐ Easy | None | **Recommended** |
| Render | Free | ⭐ Easy | 30s | Budget |
| Docker on VPS | $5-10/mo | ⭐⭐⭐ Medium | None | Control |
| AWS/GCP | Variable | ⭐⭐⭐⭐ Hard | Depends | Enterprise |

---

## 🐛 Troubleshooting

### Python Service Won't Start
```bash
# Check logs on Railway/Render
# Look for:
# - Missing dependencies
# - Port binding issues
# - Import errors

# Test locally first:
cd topsis-service
python app.py
# Should see: "Running on http://0.0.0.0:5001"
```

### Next.js Can't Connect to Python
```bash
# Check environment variable
# On Vercel: Settings → Environment Variables
# Verify PYTHON_TOPSIS_URL is correct

# Test Python service directly:
curl https://your-python-service.railway.app/health
# Should return: {"status": "healthy"}
```

### CORS Errors
The Flask app already has CORS enabled:
```python
from flask_cors import CORS
CORS(app)
```

If you still get CORS errors, check that the Python service URL is correct.

---

## ✅ Verification Checklist

After deployment:

- [ ] Python service health check works: `https://your-python-url/health`
- [ ] Next.js app loads: `https://your-nextjs-url`
- [ ] Map displays correctly (Mapbox token working)
- [ ] Can select grid cells
- [ ] "Analyze Sites" button works
- [ ] Results display with rankings
- [ ] No console errors

---

## 💡 Pro Tips

1. **Use Railway for Python** - It's the easiest and most reliable free option
2. **Use Vercel for Next.js** - Built specifically for Next.js
3. **Test locally first** - Make sure both services work with `docker-compose up`
4. **Check logs** - Both platforms have excellent logging
5. **Free tier limits** - Railway: 500 hours/month, Vercel: 100GB bandwidth/month

---

## 🆘 Need Help?

Common issues:
- **"fetch failed"** → Python service not running or wrong URL
- **"Map not loading"** → Check Mapbox token
- **"TOPSIS score 0.0"** → Python service working but data issue (already fixed)
- **"502 Bad Gateway"** → Python service crashed, check logs
