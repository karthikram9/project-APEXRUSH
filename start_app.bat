@echo off
echo ================================
echo   Starting VitalScan...
echo ================================

start "VitalScan Backend" cmd /k "cd /d C:\Users\karthikpc\VitalScan-Ai\backend && python -m uvicorn main:app --reload"

timeout /t 4 /nobreak >nul

start "VitalScan Frontend" cmd /k "cd /d C:\Users\karthikpc\VitalScan-Ai\frontend && npm run dev"

timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

echo ================================
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo  Browser opening automatically...
echo ================================
pause
