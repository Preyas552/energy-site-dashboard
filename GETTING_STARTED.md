# 🚀 Energy Site Selector - Getting Started Guide

Welcome! This guide will help you run the Energy Site Selector application on your computer in just a few minutes.

---

## 📋 What You'll Need

- A computer (Windows, Mac, or Linux)
- Internet connection
- 15 minutes of your time
- A Mapbox account (free - we'll show you how)

---

## 🎯 Quick Overview

This application helps you:
1. Select potential solar energy sites on a map
2. Analyze them using real NASA solar data
3. Get ranked recommendations using AI algorithms

**Tech Stack**: Next.js (frontend) + Python (analysis engine)

---

## 📥 Step 1: Install Docker

Docker lets you run the application without installing a bunch of dependencies.

### Windows

1. Download [Docker Desktop for Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe)
2. Run the installer
3. Follow the installation wizard
4. Restart your computer when prompted
5. Open Docker Desktop and wait for it to start

### Mac

1. Download [Docker Desktop for Mac](https://desktop.docker.com/mac/main/amd64/Docker.dmg)
2. Open the downloaded file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Follow the setup wizard

### Linux (Ubuntu/Debian)

```bash
# Run these commands in terminal
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and log back in, then:
```bash
sudo systemctl start docker
```

### ✅ Verify Docker is Installed

Open a terminal/command prompt and run:
```bash
docker --version
docker-compose --version
```

You should see version numbers. If you do, you're good to go! 🎉

---

## 🗺️ Step 2: Get a Mapbox Token (Free)

The application uses Mapbox for the interactive map.

1. Go to https://account.mapbox.com/auth/signup/
2. Sign up for a free account (no credit card required)
3. After signing in, go to https://account.mapbox.com/access-tokens/
4. Copy your **Default public token** (starts with `pk.`)
5. Keep this token handy - you'll need it in Step 4!

**Example token**: `pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example`

---

## 💾 Step 3: Download the Application

### Option A: Using Git (Recommended)

If you have Git installed:
```bash
git clone https://github.com/yourusername/energy-site-selector.git
cd energy-site-selector
```

### Option B: Download ZIP

1. Go to the GitHub repository
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file
5. Open terminal/command prompt in the extracted folder

---

## ⚙️ Step 4: Configure Your Mapbox Token

### Windows

1. Open Notepad
2. Type: `NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here`
3. Replace `your_token_here` with your actual Mapbox token
4. Save as `.env` (with the dot at the start) in the project folder
5. Make sure "Save as type" is set to "All Files"

### Mac/Linux

Open terminal in the project folder and run:
```bash
echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here" > .env
```

Replace `your_token_here` with your actual Mapbox token.

**Example:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example
```

---

## 🚀 Step 5: Run the Application

### Open Terminal/Command Prompt

- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type "Terminal", press Enter
- **Linux**: Press `Ctrl + Alt + T`

### Navigate to Project Folder

```bash
cd path/to/energy-site-selector
```

**Example:**
- Windows: `cd C:\Users\YourName\Downloads\energy-site-selector`
- Mac/Linux: `cd ~/Downloads/energy-site-selector`

### Start the Application

```bash
docker-compose up --build
```

**What happens now:**
1. Docker downloads required images (first time only - takes 5-10 minutes)
2. Builds your application containers
3. Starts both services (Python + Next.js)

You'll see lots of text scrolling. Wait for these messages:
```
✓ Container topsis-service       Started
✓ Container energy-site-selector Started
```

---

## 🌐 Step 6: Open the Application

1. Open your web browser (Chrome, Firefox, Safari, Edge)
2. Go to: **http://localhost:3000**
3. You should see a map! 🗺️

---

## 🎮 Step 7: Use the Application

### Select Sites
1. Click on grid cells on the map to select potential solar sites
2. Adjacent cells automatically merge into single sites (shown in green)
3. You'll see the count update in the control panel

### Analyze Sites
1. After selecting sites, click **"Analyze Sites"** button
2. Wait while the app:
   - Fetches real solar data from NASA
   - Processes historical patterns
   - Runs AI analysis
   - Ranks your sites
3. Results appear on the right side with rankings!

### View Results
- Sites are color-coded: 🟢 Green (best) → 🔴 Red (worst)
- Click on a result to see detailed metrics
- The #1 ranked site has a thick border

---

## 🛑 Step 8: Stop the Application

When you're done:

1. Go back to the terminal/command prompt
2. Press `Ctrl + C` (Windows/Linux) or `Cmd + C` (Mac)
3. Wait for containers to stop

Or run in a new terminal:
```bash
docker-compose down
```

---

## 🔄 Running Again Later

Next time you want to use the app:

1. Open terminal in the project folder
2. Run: `docker-compose up`
3. Open http://localhost:3000

No need to rebuild! It starts much faster the second time.

---

## 🐛 Troubleshooting

### Problem: "Port 3000 is already in use"

**Solution:**
```bash
# Stop the conflicting service
docker-compose down

# Or use a different port
# Edit docker-compose.yml and change "3000:3000" to "3001:3000"
# Then access at http://localhost:3001
```

### Problem: "Cannot connect to Docker daemon"

**Solution:**
- Make sure Docker Desktop is running
- Look for the Docker icon in your system tray/menu bar
- If not running, open Docker Desktop and wait for it to start

### Problem: Map not loading

**Solution:**
1. Check your `.env` file has the correct Mapbox token
2. Make sure the token starts with `pk.`
3. Restart the application:
   ```bash
   docker-compose down
   docker-compose up
   ```

### Problem: "Analyze Sites" button doesn't work

**Solution:**
1. Check if both containers are running:
   ```bash
   docker-compose ps
   ```
2. Both should show "Up" status
3. Check logs:
   ```bash
   docker-compose logs
   ```

### Problem: Application is slow

**Solution:**
- First time is slower (downloading data)
- Make sure you have good internet connection
- NASA API can be slow sometimes - just wait a bit longer

---

## 📊 What's Happening Behind the Scenes?

When you click "Analyze Sites":

1. **Fetch Data**: Gets 5 years of solar data from NASA POWER API
2. **Process**: Calculates statistics and generates fuzzy numbers
3. **Analyze**: Python service runs fuzzy TOPSIS algorithm
4. **Rank**: Sites are ranked from best to worst
5. **Display**: Results shown on map with colors and scores

---

## 💡 Tips & Tricks

### Run in Background
```bash
# Start in background (detached mode)
docker-compose up -d

# View logs anytime
docker-compose logs -f

# Stop
docker-compose down
```

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# Last 50 lines
docker-compose logs --tail=50
```

### Clean Restart
```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up --build
```

---

## 🎓 Understanding the Results

### TOPSIS Score (0-100)
- **80-100**: Excellent site
- **60-79**: Good site
- **40-59**: Fair site
- **0-39**: Poor site

### Criteria Explained
- **Solar Potential**: Average solar irradiance (W/m²) - higher is better
- **Land Suitability**: How suitable the land is (0-100) - higher is better
- **Grid Proximity**: Distance to power grid (km) - lower is better
- **Installation Cost**: Estimated cost per kW - lower is better

---

## 📁 Project Structure

```
energy-site-selector/
├── energy-site-selector/    # Next.js frontend
├── topsis-service/          # Python analysis engine
├── docker-compose.yml       # Docker configuration
├── .env                     # Your Mapbox token (you create this)
└── GETTING_STARTED.md      # This file!
```

---

## 🆘 Need More Help?

### Check Logs
```bash
docker-compose logs -f
```

### Test Services Individually
```bash
# Test TOPSIS service
curl http://localhost:5001/health

# Test Next.js
curl http://localhost:3000/api/health
```

### Common Issues

**"Cannot find .env file"**
- Make sure you created the `.env` file in the project root
- Check the filename is exactly `.env` (with the dot)

**"Invalid Mapbox token"**
- Verify your token on https://account.mapbox.com/access-tokens/
- Make sure you copied the entire token
- Token should start with `pk.`

**"Docker command not found"**
- Docker Desktop might not be running
- Restart Docker Desktop
- On Linux, try `sudo docker-compose up`

---

## 🎉 Success Checklist

- [ ] Docker installed and running
- [ ] Mapbox account created
- [ ] Mapbox token copied
- [ ] Project downloaded
- [ ] `.env` file created with token
- [ ] `docker-compose up` executed
- [ ] Containers started successfully
- [ ] http://localhost:3000 opens in browser
- [ ] Map displays correctly
- [ ] Can select grid cells
- [ ] "Analyze Sites" works
- [ ] Results display with rankings

---

## 🚀 You're All Set!

Congratulations! You now have a working solar site analysis tool. 

**What to try:**
1. Select different locations on the map
2. Compare urban vs rural areas
3. Try different site sizes (1 cell vs multiple cells)
4. Check how rankings change with location

**Share your results!** Take screenshots and share with friends.

---

## 📚 Additional Resources

- **Full Documentation**: See `CONTAINER_DEPLOYMENT.md`
- **Deployment Guide**: See `AZURE_DEPLOYMENT.md`
- **Technical Details**: See `requirements.md` and `design.md`

---

## 🤝 Contributing

Found a bug? Have a suggestion? 
- Open an issue on GitHub
- Submit a pull request
- Share your feedback!

---

## 📝 Quick Command Reference

```bash
# Start application
docker-compose up

# Start in background
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Restart after changes
docker-compose up --build

# Check status
docker-compose ps

# Clean restart
docker-compose down -v && docker-compose up --build
```

---

## ✨ Enjoy!

You're now ready to analyze solar energy sites like a pro! 🌞

If you found this helpful, give the project a ⭐ on GitHub!

---

**Questions?** Check the troubleshooting section or open an issue on GitHub.

**Happy analyzing!** 🎉
