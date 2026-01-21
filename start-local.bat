@echo off
REM Local Development Start Script (without Docker)
REM For Windows

echo ================================
echo   Energy Site Selector (Local)
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    exit /b 1
)
echo [OK] Python is installed

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    exit /b 1
)
echo [OK] Node.js is installed

REM Check if .env file exists
if not exist "energy-site-selector\.env" (
    echo [WARNING] .env file not found in energy-site-selector\
    echo.
    set /p MAPBOX_TOKEN="Enter your Mapbox token: "
    echo NEXT_PUBLIC_MAPBOX_TOKEN=%MAPBOX_TOKEN% > energy-site-selector\.env
    echo [OK] .env file created
)

echo.
echo Setting up Python TOPSIS service...

REM Navigate to topsis-service
cd topsis-service

REM Check if venv exists, create if not
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing Python dependencies...
pip install -r requirements.txt

echo [OK] Python service ready
echo.

REM Start Python service in background
echo Starting Python TOPSIS service on port 5001...
start "Python TOPSIS Service" cmd /k "venv\Scripts\activate.bat && python app.py"
echo [OK] Python service started

REM Go back to root
cd ..

echo.
echo Setting up Next.js frontend...

REM Navigate to energy-site-selector
cd energy-site-selector

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    echo [OK] npm dependencies installed
)

echo.
echo Starting Next.js development server on port 3000...
echo.
echo ================================
echo Services are starting!
echo ================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001
echo.
echo Press Ctrl+C to stop the frontend
echo Close the Python service window to stop the backend
echo.

REM Start Next.js (this will run in foreground)
call npm run dev

