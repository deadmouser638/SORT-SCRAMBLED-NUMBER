@echo off
TITLE Sort Scramble Visualizer Environment
echo ===================================================
echo   Starting Sort Scramble Algorithm Visualizer
echo ===================================================
echo.
echo Activating Python environment (if available)...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [!] Virtual environment not found. Using global interpreter.
)

echo.
echo Launching Flask application...
set FLASK_ENV=dev
set FLASK_DEBUG=True
set PORT=5000

start "Sort Scramble Backend" cmd /c "python app.py"

echo.
echo Launching browser to http://127.0.0.1:5000...
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5000

echo.
echo Environment running. Press any key to stop both server and close this window.
pause >nul

echo Closing environment...
taskkill /F /FI "WINDOWTITLE eq Sort Scramble Backend*" >nul 2>&1
exit
