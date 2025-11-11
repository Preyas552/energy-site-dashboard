# 🎮 Run Scripts - Quick Reference

## 📦 What's Been Created

I've created easy-to-use scripts so you and your friends can run the application without knowing Docker commands!

---

## 🚀 Scripts Available

### 1. **Interactive Menu Scripts** (Recommended)
- `run.sh` (Mac/Linux)
- `run.bat` (Windows)

**Features:**
- ✅ Checks if Docker is running
- ✅ Helps create .env file
- ✅ Interactive menu with 7 options
- ✅ User-friendly error messages
- ✅ Color-coded output (Mac/Linux)

### 2. **Quick Start Scripts**
- `start.sh` (Mac/Linux)
- `start.bat` (Windows)

**Features:**
- ✅ Just starts the app
- ✅ No menu, no questions
- ✅ Perfect for daily use

### 3. **Stop Scripts**
- `stop.sh` (Mac/Linux)
- `stop.bat` (Windows)

**Features:**
- ✅ Stops all containers
- ✅ Quick cleanup

---

## 🎯 How to Use

### For You (First Time)

**Mac/Linux:**
```bash
./run.sh
# Choose option 1 (Start with build)
```

**Windows:**
```cmd
run.bat
REM Choose option 1 (Start with build)
```

### For Your Friends

Tell them:

**Windows Users:**
1. Download the project
2. Double-click `run.bat`
3. Enter Mapbox token when asked
4. Choose option 1
5. Wait 5-10 minutes
6. Open http://localhost:3000

**Mac/Linux Users:**
1. Download the project
2. Open terminal in project folder
3. Run: `./run.sh`
4. Enter Mapbox token when asked
5. Choose option 1
6. Wait 5-10 minutes
7. Open http://localhost:3000

---

## 📋 Menu Options Explained

When you run `run.sh` or `run.bat`, you get this menu:

```
1) Start the application (first time - will build)
   → Use this the FIRST time you run the app
   → Builds Docker images (takes 5-10 minutes)

2) Start the application (quick start)
   → Use this for subsequent runs
   → Much faster (30 seconds)

3) Stop the application
   → Stops all containers
   → Frees up resources

4) View logs
   → See what's happening
   → Debug issues
   → Press Ctrl+C to exit

5) Restart the application
   → Quick restart without rebuilding
   → Useful if something hangs

6) Clean restart (rebuild everything)
   → Nuclear option
   → Deletes everything and rebuilds
   → Use if something is broken

7) Exit
   → Quit the script
```

---

## 💡 Common Scenarios

### Scenario 1: First Time Setup
```bash
./run.sh          # Mac/Linux
run.bat           # Windows

# Choose: 1 (Start with build)
# Wait: 5-10 minutes
# Open: http://localhost:3000
```

### Scenario 2: Daily Use
```bash
./start.sh        # Mac/Linux
start.bat         # Windows

# Opens automatically
```

### Scenario 3: Something's Not Working
```bash
./run.sh          # Mac/Linux
run.bat           # Windows

# Choose: 6 (Clean restart)
# This fixes 90% of issues
```

### Scenario 4: Want to See Logs
```bash
./run.sh          # Mac/Linux
run.bat           # Windows

# Choose: 4 (View logs)
# Press Ctrl+C when done
```

### Scenario 5: Done for the Day
```bash
./stop.sh         # Mac/Linux
stop.bat          # Windows

# All stopped!
```

---

## 🎓 What Makes These Scripts Great

### For Beginners
- ✅ No Docker knowledge needed
- ✅ No command line expertise required
- ✅ Interactive and guided
- ✅ Helpful error messages
- ✅ Creates .env file for you

### For Developers
- ✅ Quick start option available
- ✅ All common operations in one place
- ✅ No need to remember Docker commands
- ✅ Fast workflow

### For Everyone
- ✅ Cross-platform (Windows, Mac, Linux)
- ✅ Consistent experience
- ✅ Easy to share with friends
- ✅ Self-documenting

---

## 📁 Files Created

```
project-root/
├── run.sh              # Interactive menu (Mac/Linux)
├── run.bat             # Interactive menu (Windows)
├── start.sh            # Quick start (Mac/Linux)
├── start.bat           # Quick start (Windows)
├── stop.sh             # Stop script (Mac/Linux)
├── stop.bat            # Stop script (Windows)
└── SCRIPTS_README.md   # This documentation
```

---

## 🔧 Technical Details

### What the Scripts Do

1. **Check Docker Installation**
   - Verifies Docker is installed
   - Checks if Docker daemon is running
   - Shows helpful error if not

2. **Check/Create .env File**
   - Looks for .env file
   - Prompts for Mapbox token if missing
   - Creates .env file automatically

3. **Run Docker Commands**
   - Executes appropriate docker-compose commands
   - Shows progress and status
   - Handles errors gracefully

4. **Provide Feedback**
   - Color-coded output (Mac/Linux)
   - Clear success/error messages
   - Shows next steps

---

## 🐛 Troubleshooting

### "Permission denied" (Mac/Linux)
```bash
chmod +x run.sh start.sh stop.sh
```

### "Command not found" (Mac/Linux)
```bash
# Make sure you're in the project directory
cd /path/to/energy-site-selector

# Then run
./run.sh
```

### Scripts don't work at all
Fall back to manual commands:
```bash
docker-compose up --build
```

---

## 📤 Sharing with Friends

### What to Tell Them

"I made it super easy to run! Just:

**Windows:**
1. Download the project
2. Double-click `run.bat`
3. Follow the prompts

**Mac/Linux:**
1. Download the project
2. Open terminal in the folder
3. Run `./run.sh`
4. Follow the prompts

The script will guide you through everything!"

### What to Send Them

Send these files:
- `run.bat` or `run.sh`
- `SCRIPTS_README.md`
- `GETTING_STARTED.md` (for detailed help)

---

## ✅ Success Checklist

After running the script, you should see:

- [ ] "Docker is installed and running" ✓
- [ ] ".env file exists" ✓
- [ ] Containers building/starting
- [ ] "Application is running!" message
- [ ] Can open http://localhost:3000
- [ ] Map loads correctly

---

## 🎉 Summary

You now have:
- ✅ Interactive menu scripts
- ✅ Quick start scripts
- ✅ Stop scripts
- ✅ Cross-platform support
- ✅ Beginner-friendly
- ✅ Developer-friendly
- ✅ Easy to share

**Your friends can now run your app with a single command!** 🚀

---

## 📚 Additional Resources

- **SCRIPTS_README.md** - Detailed script documentation
- **GETTING_STARTED.md** - Complete setup guide
- **QUICK_START.md** - Fast setup for developers
- **README.md** - Project overview

---

**Happy scripting!** 🎮
