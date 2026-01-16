# 🌞 Energy Site Selector

> AI-powered solar energy site selection using real NASA data and fuzzy TOPSIS analysis

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Perfect for**: Solar developers, researchers, students, and renewable energy enthusiasts!

---

## 🎯 What Does This Do?

This application helps you find the **best locations for solar panel installations** by:

1. 🗺️ **Interactive Selection** - Click on a map to select potential sites
2. 🛰️ **Real Data** - Fetches 5 years of solar data from NASA POWER API
3. 🤖 **AI Analysis** - Uses fuzzy TOPSIS algorithm to rank sites
4. 📊 **Visual Results** - See ranked sites color-coded on the map

---

## ✨ Features

- ✅ **Interactive grid-based site selection** on Mapbox
- ✅ **Real solar irradiance data** from NASA POWER API
- ✅ **Fuzzy number generation** from historical patterns
- ✅ **Multi-criteria decision analysis** using fuzzy TOPSIS
- ✅ **Visual ranking** with color-coded results
- ✅ **Automatic site merging** for adjacent cells
- ✅ **Fully containerized** with Docker
- ✅ **Cloud-ready** (Azure, AWS, GCP)

---

## ⚡ Quick Start

### Option 1: Using Scripts (Easiest!)

**Windows:**
```cmd
run.bat
```

**Mac/Linux:**
```bash
./run.sh
```

### Option 2: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/energy-site-selector.git
cd energy-site-selector

# 2. Set your Mapbox token (get free token at https://account.mapbox.com/)
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env

# 3. Run with Docker
docker-compose up --build

# 4. Open http://localhost:3000
```

### Option 3: Manual Setup

See [GETTING_STARTED.md](GETTING_STARTED.md) for detailed instructions.

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
=======
**That's it!** 🎉
>>>>>>> master

---

## 📚 Documentation

### 🆕 New Users
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete beginner-friendly guide
- **[SETUP_INSTRUCTIONS.txt](SETUP_INSTRUCTIONS.txt)** - Printable text version

### ⚡ Experienced Users
- **[QUICK_START.md](QUICK_START.md)** - Fast setup for developers

### 🐳 Deployment
- **[CONTAINER_DEPLOYMENT.md](CONTAINER_DEPLOYMENT.md)** - Docker & Kubernetes
- **[AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)** - Deploy to Azure
- **[AZURE_BACKEND_OPTIONS.md](AZURE_BACKEND_OPTIONS.md)** - Azure backend hosting

### 📖 Technical Documentation
- **[requirements.md](requirements.md)** - Full requirements specification
- **[design.md](design.md)** - Architecture and design decisions
- **[tasks.md](tasks.md)** - Implementation tasks

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

**Project Structure**:
```
energy-site-selector/
├── app/                     # Next.js frontend application
│   ├── api/                 # API routes
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout
├── components/              # React components
├── lib/                     # Utility functions
├── topsis-service/          # Python TOPSIS analysis engine
├── azure-functions/         # Azure Functions (optional)
├── k8s/                     # Kubernetes manifests
└── docker-compose.yml       # Docker Compose configuration
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

## 🚀 Deployment Options

| Platform | Difficulty | Cost/Month | Guide |
|----------|-----------|------------|-------|
| **Local (Docker)** | ⭐ Easy | $0 | [Quick Start](QUICK_START.md) |
| **Azure Container Apps** | ⭐⭐ Easy | $20-40 | [Azure Guide](AZURE_DEPLOYMENT.md) |
| **AWS ECS** | ⭐⭐⭐ Medium | $30-60 | [Container Guide](CONTAINER_DEPLOYMENT.md) |
| **Kubernetes** | ⭐⭐⭐⭐ Hard | $70+ | [K8s Guide](CONTAINER_DEPLOYMENT.md) |

---

## 🎮 Usage

1. Open http://localhost:3000
2. Click on grid cells to select sites
3. Click "Analyze Sites"
4. Wait 30-60 seconds
5. View ranked results!

**Results Color Coding**:
- 🟢 Green = Excellent (80-100)
- 🟡 Yellow = Good (60-79)
- 🟠 Orange = Fair (40-59)
- 🔴 Red = Poor (0-39)
>>>>>>> master

---

## 🎮 Usage

1. **Select Sites**: Click on grid cells on the map
2. **Merge Sites**: Adjacent cells automatically merge (shown in green)
3. **Analyze**: Click "Analyze Sites" button
4. **Wait**: Application fetches NASA data and runs analysis (30-60 seconds)
5. **View Results**: See ranked sites with color coding:
   - 🟢 Green = Excellent (80-100)
   - 🟡 Yellow = Good (60-79)
   - 🟠 Orange = Fair (40-59)
   - 🔴 Red = Poor (0-39)

---

## 🐳 Docker Commands

```bash
# Start
docker-compose up

# Start in background
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build
```

---

## 🌐 Deployment Options

| Platform | Difficulty | Cost/Month | Guide |
|----------|-----------|------------|-------|
| **Local (Docker)** | ⭐ Easy | $0 | [Quick Start](QUICK_START.md) |
| **Azure Container Apps** | ⭐⭐ Easy | $20-40 | [Azure Guide](AZURE_DEPLOYMENT.md) |
| **AWS ECS** | ⭐⭐⭐ Medium | $30-60 | [Container Guide](CONTAINER_DEPLOYMENT.md) |
| **Kubernetes** | ⭐⭐⭐⭐ Hard | $70+ | [K8s Guide](CONTAINER_DEPLOYMENT.md) |

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

## 📧 Support

- **Documentation**: See guides above
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/energy-site-selector/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/energy-site-selector/discussions)

---

## ⭐ Star This Project

If you find this project useful, please give it a star! It helps others discover it.

---

**Built with ❤️ for renewable energy**

🌞 Happy analyzing!
