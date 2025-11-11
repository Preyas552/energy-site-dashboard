# 🌞 Energy Site Selector

> AI-powered solar energy site selection using real NASA data and fuzzy TOPSIS analysis

**Perfect for**: Solar developers, researchers, students, and renewable energy enthusiasts!

---

## 🎯 What Does This Do?

Select potential solar panel locations on an interactive map, and let AI analyze them using:
- 🛰️ **Real NASA solar data** (5 years of historical data)
- 🤖 **Fuzzy TOPSIS algorithm** (multi-criteria decision analysis)
- 📊 **Visual rankings** (color-coded results on the map)

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

### Option 2: Manual Commands

```bash
# 1. Clone
git clone https://github.com/yourusername/energy-site-selector.git
cd energy-site-selector

# 2. Configure (get free token at https://account.mapbox.com/)
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env

# 3. Run
docker-compose up --build

# 4. Open http://localhost:3000
```

**That's it!** 🎉

---

## 📚 Documentation

Choose your path:

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

## 🏗️ Project Structure

```
energy-site-selector/
├── energy-site-selector/    # Next.js frontend application
├── topsis-service/          # Python TOPSIS analysis engine
├── azure-functions/         # Azure Functions (optional)
├── k8s/                     # Kubernetes manifests
├── docker-compose.yml       # Docker Compose configuration
└── docs/                    # Documentation
```

---

## ✨ Features

- ✅ Interactive grid-based site selection
- ✅ Real-time solar data from NASA POWER API
- ✅ Fuzzy number generation from historical patterns
- ✅ Multi-criteria decision analysis (fuzzy TOPSIS)
- ✅ Visual ranking with color-coded results
- ✅ Automatic merging of adjacent sites
- ✅ Fully containerized with Docker
- ✅ Cloud-ready (Azure, AWS, GCP)

---

## 🛠️ Technology Stack

**Frontend**: Next.js 16, TypeScript, Mapbox GL JS, Deck.gl, Tailwind CSS  
**Backend**: Python Flask, NumPy, Fuzzy TOPSIS  
**Data**: NASA POWER API  
**Deployment**: Docker, Kubernetes, Azure Container Apps

---

## 📊 How It Works

1. **Select** - Click grid cells on the map
2. **Fetch** - Get 5 years of NASA solar data
3. **Process** - Generate fuzzy numbers from historical patterns
4. **Analyze** - Run fuzzy TOPSIS algorithm
5. **Rank** - Display color-coded results

**Analysis Criteria**:
- Solar Potential (40%)
- Land Suitability (30%)
- Grid Proximity (20%)
- Installation Cost (10%)

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

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- **NASA POWER API** - Free solar irradiance data
- **Mapbox** - Interactive mapping platform
- **Deck.gl** - WebGL visualizations
- **Next.js** - React framework

---

## 📧 Support

- **Documentation**: See guides above
- **Issues**: [GitHub Issues](https://github.com/yourusername/energy-site-selector/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/energy-site-selector/discussions)

---

## ⭐ Star This Project

If you find this useful, please give it a star! It helps others discover it.

---

**Built with ❤️ for renewable energy**

🌞 Happy analyzing!
