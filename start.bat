@echo off
REM Quick Start Script - Just runs the application
REM For Windows

echo Starting Energy Site Selector...
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo.
    echo Creating .env file...
    set /p MAPBOX_TOKEN="Enter your Mapbox token: "
    echo NEXT_PUBLIC_MAPBOX_TOKEN=%MAPBOX_TOKEN% > .env
    echo [OK] .env file created
    echo.
)

REM Start the application
docker-compose up --build

echo.
echo [OK] Application started!
echo Open: http://localhost:3000
pause
