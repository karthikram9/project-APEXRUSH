@echo off
echo Starting VitalScan Backend Server...
start cmd /k "cd c:\VITALSCAN\backend && python -m uvicorn main:app --reload"

echo Starting VitalScan Frontend Server...
start cmd /k "cd c:\VITALSCAN\frontend && npm run dev"

echo Both servers are starting up!
echo Backend will be available at http://localhost:8000
echo Frontend will be available at http://localhost:5173
pause
