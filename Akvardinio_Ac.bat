@echo off
setlocal
cd /d "%~dp0"
set "PORT=8097"

where python >nul 2>nul
if errorlevel 1 (
    echo Python bulunamadi. Lutfen Python kurun veya projeyi http://127.0.0.1:8097/index.html adresinden calistirin.
    pause
    exit /b 1
)

start "" "http://127.0.0.1:%PORT%/index.html"
python -m http.server %PORT%
