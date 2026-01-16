@echo off
REM Energy Site Selector - Run Script
REM For Windows

echo ================================
echo   Energy Site Selector
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is installed and running
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo.
    echo Please create a .env file with your Mapbox token.
    echo.
    set /p MAPBOX_TOKEN="Enter your Mapbox token (or press Enter to skip): "
    
    if "!MAPBOX_TOKEN!"=="" (
        echo Creating .env file with placeholder...
        echo NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here > .env
        echo.
        echo [WARNING] Please edit .env file and add your Mapbox token!
        echo Get your token at: https://account.mapbox.com/access-tokens/
        pause
        exit /b 1
    ) else (
        echo NEXT_PUBLIC_MAPBOX_TOKEN=!MAPBOX_TOKEN! > .env
        echo [OK] .env file created
    )
)

echo [OK] .env file exists
echo.

REM Menu
:menu
echo What would you like to do?
echo.
echo 1) Start the application (first time - will build)
echo 2) Start the application (quick start)
echo 3) Stop the application
echo 4) View logs
echo 5) Restart the application
echo 6) Clean restart (rebuild everything)
echo 7) Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto start_build
if "%choice%"=="2" goto start
if "%choice%"=="3" goto stop
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto restart
if "%choice%"=="6" goto clean
if "%choice%"=="7" goto exit
echo.
echo [ERROR] Invalid choice
pause
exit /b 1

:start_build
echo.
echo Starting application (building images)...
echo This may take 5-10 minutes on first run...
echo.
docker-compose up --build
goto end

:start
echo.
echo Starting application...
echo.
docker-compose up
goto end

:stop
echo.
echo Stopping application...
docker-compose down
echo [OK] Application stopped
pause
exit /b 0

:logs
echo.
echo Viewing logs (press Ctrl+C to exit)...
echo.
docker-compose logs -f
pause
exit /b 0

:restart
echo.
echo Restarting application...
docker-compose restart
echo [OK] Application restarted
echo.
echo Open: http://localhost:3000
pause
exit /b 0

:clean
echo.
echo Cleaning and rebuilding...
docker-compose down -v
echo.
echo Building and starting...
docker-compose up --build
goto end

:exit
echo.
echo Goodbye!
exit /b 0

:end
echo.
echo ================================
echo Application is running!
echo ================================
echo.
echo Open in your browser:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop
pause
