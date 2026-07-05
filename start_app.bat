@echo off
cd /d "%~dp0"
echo ================================
echo   Starting VitalScan...
echo ================================

start "VitalScan Backend" cmd /k "cd backend && if exist ..\.venv\Scripts\activate.bat (call ..\.venv\Scripts\activate.bat) && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 4 /nobreak >nul

start "VitalScan Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

echo ================================
echo  Backend:  http://127.0.0.1:8000
echo  Frontend: http://localhost:5173
echo  Browser opening automatically...
echo ================================
pause
