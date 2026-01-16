# 🎮 Run Scripts Guide

Easy-to-use scripts to run the Energy Site Selector application!

---

## 🚀 Quick Start

### Windows
```cmd
start.bat
```

### Mac/Linux
```bash
./start.sh
```

That's it! The application will start and open at http://localhost:3000

---

## 📜 Available Scripts

### 1. Interactive Menu (Recommended)

**Windows:**
```cmd
run.bat
```

**Mac/Linux:**
```bash
./run.sh
```

**Features:**
- Interactive menu with options
- Checks if Docker is running
- Helps create .env file
- Multiple options (start, stop, logs, restart, etc.)

**Menu Options:**
1. Start (first time - builds images)
2. Start (quick start)
3. Stop
4. View logs
5. Restart
6. Clean restart (rebuild everything)
7. Exit

---

### 2. Quick Start Scripts

Just start the application without menu.

**Windows:**
```cmd
start.bat
```

**Mac/Linux:**
```bash
./start.sh
```

---

### 3. Stop Scripts

Stop the application.

**Windows:**
```cmd
stop.bat
```

**Mac/Linux:**
```bash
./stop.sh
```

---

## 📋 Prerequisites

Before running any script:

1. **Docker Desktop** must be installed and running
2. **Mapbox token** (scripts will help you create .env file)

---

## 🎯 First Time Setup

### Step 1: Get Mapbox Token
1. Go to https://account.mapbox.com/
2. Sign up (free)
3. Copy your token

### Step 2: Run the Script

**Windows:**
```cmd
run.bat
```

**Mac/Linux:**
```bash
./run.sh
```

### Step 3: Follow the Prompts
- Script will check if Docker is running
- Script will ask for your Mapbox token
- Script will create .env file
- Choose option 1 to start

### Step 4: Wait
- First time takes 5-10 minutes (downloading images)
- Subsequent runs are much faster

### Step 5: Open Browser
- Go to http://localhost:3000
- Start selecting sites!

---

## 🔧 What Each Script Does

### `run.sh` / `run.bat` (Interactive Menu)
- Checks Docker installation
- Checks if Docker is running
- Checks/creates .env file
- Shows interactive menu
- Provides multiple options

### `start.sh` / `start.bat` (Quick Start)
- Checks/creates .env file
- Starts the application
- Opens at http://localhost:3000

### `stop.sh` / `stop.bat` (Stop)
- Stops all containers
- Cleans up

---

## 💡 Common Usage Patterns

### First Time Running
```bash
# Mac/Linux
./run.sh
# Choose option 1

# Windows
run.bat
# Choose option 1
```

### Daily Use
```bash
# Mac/Linux
./start.sh

# Windows
start.bat
```

### Stop When Done
```bash
# Mac/Linux
./stop.sh

# Windows
stop.bat
```

### View Logs
```bash
# Mac/Linux
./run.sh
# Choose option 4

# Windows
run.bat
# Choose option 4
```

### Clean Restart (if something breaks)
```bash
# Mac/Linux
./run.sh
# Choose option 6

# Windows
run.bat
# Choose option 6
```

---

## 🐛 Troubleshooting

### "Permission denied" (Mac/Linux)
```bash
chmod +x run.sh start.sh stop.sh
```

### "Docker is not running"
1. Open Docker Desktop
2. Wait for it to start
3. Run the script again

### ".env file not found"
- Scripts will help you create it
- Or manually create: `echo "NEXT_PUBLIC_MAPBOX_TOKEN=your_token" > .env`

### "Port already in use"
```bash
# Stop any running containers
docker-compose down

# Or use the stop script
./stop.sh  # Mac/Linux
stop.bat   # Windows
```

---

## 📝 Manual Commands (if scripts don't work)

### Start
```bash
docker-compose up --build
```

### Stop
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart
```bash
docker-compose restart
```

---

## 🎓 For Your Friends

Tell them to:

1. **Download the project**
2. **Run the script:**
   - Windows: Double-click `run.bat`
   - Mac/Linux: Open terminal, run `./run.sh`
3. **Follow the prompts**
4. **Open http://localhost:3000**

That's it! No command line knowledge needed.

---

## ✅ Success Indicators

You'll know it's working when you see:

```
✓ Container topsis-service       Started
✓ Container energy-site-selector Started
```

Then open: http://localhost:3000

---

## 🆘 Need Help?

1. Check if Docker Desktop is running
2. Check if .env file has your Mapbox token
3. Try the "Clean restart" option (option 6)
4. Check GETTING_STARTED.md for detailed help

---

## 🎉 That's It!

These scripts make it super easy to run the application. No need to remember Docker commands!

**Enjoy!** 🌞
