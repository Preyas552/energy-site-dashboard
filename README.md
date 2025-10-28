# 🌞 Energy Site Selector

> Interactive solar energy site selection using real NASA data and AI-powered fuzzy TOPSIS analysis

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 What Does This Do?

This application helps you find the **best locations for solar panel installations** by:

1. 🗺️ **Interactive Selection** - Click on a map to select potential sites
2. 🛰️ **Real Data** - Fetches 5 years of solar data from NASA POWER API
3. 🤖 **AI Analysis** - Uses fuzzy TOPSIS algorithm to rank sites
4. 📊 **Visual Results** - See ranked sites color-coded on the map

**Perfect for**: Solar developers, researchers, students, or anyone interested in renewable energy!

---

## ✨ Features

- ✅ **Interactive grid-based site selection** on Mapbox
- ✅ **Real solar irradiance data** from NASA POWER API
- ✅ **Fuzzy number generation** from historical patterns
- ✅ **Multi-criteria decision analysis** using fuzzy TOPSIS
- ✅ **Visual ranking** with color-coded results
- ✅ **Automatic site merging** for adjacent cells
- ✅ **Fully containerized** with Docker

---

## 🚀 Quick Start

### Option 1: Docker (Recommended - 5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/energy-site-selector.git
cd energy-site-selector

# 2. Set your Mapbox token
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env

# 3. Run with Docker
docker-compose up --build

# 4. Open http://localhost:3000
```

**Get Mapbox token**: https://account.mapbox.com/ (free)

### Option 2: Manual Setup

See [GETTING_STARTED.md](../GETTING_STARTED.md) for detailed instructions.

---

## 📸 Screenshots

### Site Selection
![Site Selection](docs/screenshot-selection.png)
*Click grid cells to select potential solar sites*

### Analysis Results
![Results](docs/screenshot-results.png)
*AI-powered ranking with detailed metrics*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Next.js Frontend (Port 3000)     │
│   - Interactive map (Mapbox)       │
│   - Grid selection (Deck.gl)       │
│   - Results visualization           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   API Routes (Next.js)              │
│   - NASA POWER proxy                │
│   - Data processing                 │
│   - Fuzzy number generation         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Python TOPSIS Service (Port 5001)│
│   - Fuzzy TOPSIS algorithm          │
│   - Multi-criteria analysis         │
│   - Site ranking                    │
└─────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Map**: Mapbox GL JS
- **Visualization**: Deck.gl
- **Styling**: Tailwind CSS

### Backend
- **API Routes**: Next.js API Routes
- **Analysis Engine**: Python Flask
- **Algorithm**: Fuzzy TOPSIS
- **Data Source**: NASA POWER API

### Deployment
- **Containers**: Docker & Docker Compose
- **Cloud**: Azure Container Apps / AWS ECS / Google Cloud Run
- **CI/CD**: GitHub Actions ready

---

## 📚 Documentation

- 📖 **[Getting Started Guide](../GETTING_STARTED.md)** - Detailed setup for beginners
- ⚡ **[Quick Start](../QUICK_START.md)** - For experienced users
- 🐳 **[Container Deployment](../CONTAINER_DEPLOYMENT.md)** - Docker & Kubernetes
- ☁️ **[Azure Deployment](../AZURE_DEPLOYMENT.md)** - Deploy to Azure
- 📋 **[Requirements](../requirements.md)** - Full requirements specification
- 🎨 **[Design Document](../design.md)** - Architecture and design decisions

---

## 🎮 How to Use

1. **Select Sites**: Click on grid cells on the map
2. **Merge Sites**: Adjacent cells automatically merge (shown in green)
3. **Analyze**: Click "Analyze Sites" button
4. **Wait**: Application fetches NASA data and runs analysis (30-60 seconds)
5. **View Results**: See ranked sites with color coding:
   - 🟢 Green = Best sites
   - 🟡 Yellow = Good sites
   - 🟠 Orange = Fair sites
   - 🔴 Red = Poor sites

---

## 📊 Analysis Criteria

The fuzzy TOPSIS algorithm evaluates sites based on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Solar Potential** | 40% | Average solar irradiance (W/m²) |
| **Land Suitability** | 30% | Terrain and land use suitability |
| **Grid Proximity** | 20% | Distance to power grid |
| **Installation Cost** | 10% | Estimated installation cost per kW |

---

## 🔧 Development

### Project Structure

```
energy-site-selector/
├── app/
│   ├── api/
│   │   ├── nasa-power/      # NASA POWER API proxy
│   │   └── topsis/          # TOPSIS analysis endpoint
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout
├── components/
│   ├── MapContainer.tsx     # Main map component
│   ├── GridLayer.tsx        # Grid overlay
│   ├── ControlPanel.tsx     # UI controls
│   └── ResultsPanel.tsx     # Results display
├── lib/
│   ├── types.ts             # TypeScript types
│   ├── gridUtils.ts         # Grid generation & merging
│   ├── fuzzyUtils.ts        # Fuzzy number generation
│   ├── solarDataUtils.ts    # Solar data processing
│   └── topsisTypes.ts       # TOPSIS types
└── public/                  # Static assets
```

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

---

## 🌐 Deployment Options

| Platform | Difficulty | Cost | Guide |
|----------|-----------|------|-------|
| **Docker Compose** | ⭐ Easy | $0 | [Guide](../CONTAINER_DEPLOYMENT.md) |
| **Azure Container Apps** | ⭐⭐ Easy | $20-40/mo | [Guide](../AZURE_DEPLOYMENT.md) |
| **AWS ECS** | ⭐⭐⭐ Medium | $30-60/mo | [Guide](../CONTAINER_DEPLOYMENT.md) |
| **Kubernetes** | ⭐⭐⭐⭐ Hard | $70+/mo | [Guide](../CONTAINER_DEPLOYMENT.md) |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA POWER API** - For providing free solar irradiance data
- **Mapbox** - For the interactive mapping platform
- **Deck.gl** - For powerful WebGL-based visualizations
- **Next.js** - For the amazing React framework

---

## 📧 Contact

Have questions? Open an issue or reach out!

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/energy-site-selector/issues)
- **Email**: your.email@example.com

---

## ⭐ Star This Project

If you find this project useful, please give it a star! It helps others discover it.

---

**Built with ❤️ for renewable energy**
