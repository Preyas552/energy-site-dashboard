@echo off
REM Setup script for Python TOPSIS service (Windows)

echo Setting up Python TOPSIS service...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Setup complete!
echo.
echo To run the service:
echo   venv\Scripts\activate
echo   python app.py
