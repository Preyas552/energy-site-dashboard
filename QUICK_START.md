# ⚡ Quick Start - Energy Site Selector

**For experienced users who just want to run it fast!**

---

## 🎯 Prerequisites

- Docker & Docker Compose installed
- Mapbox token (get free at https://account.mapbox.com/)

---

## 🚀 3-Step Setup

### 1. Clone & Navigate
```bash
git clone https://github.com/yourusername/energy-site-selector.git
cd energy-site-selector
```

### 2. Configure Token
```bash
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env
```

### 3. Run
```bash
docker-compose up --build
```

**Access**: http://localhost:3000

---

## 📝 Common Commands

```bash
# Start (first time)
docker-compose up --build

# Start (subsequent times)
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart after code changes
docker-compose up --build

# Clean restart
docker-compose down -v && docker-compose up --build

# Check status
docker-compose ps
```

---

## 🔍 Health Checks

```bash
# TOPSIS service
curl http://localhost:5001/health

# Next.js app
curl http://localhost:3000/api/health
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `docker-compose down` or change port in `docker-compose.yml` |
| Docker not running | Start Docker Desktop |
| Map not loading | Check `.env` file has correct Mapbox token |
| Slow analysis | NASA API can be slow, wait 30-60 seconds |

---

## 📦 What's Running

- **Next.js** (Frontend): http://localhost:3000
- **Python TOPSIS** (Backend): http://localhost:5001

---

## 🎮 How to Use

1. Open http://localhost:3000
2. Click grid cells on map to select sites
3. Click "Analyze Sites" button
4. Wait for results (30-60 seconds)
5. View ranked sites on the right panel

---

## 🛑 Stop Everything

```bash
docker-compose down
```

---

**Need detailed help?** See `GETTING_STARTED.md`

**Deploy to cloud?** See `AZURE_DEPLOYMENT.md` or `CONTAINER_DEPLOYMENT.md`
