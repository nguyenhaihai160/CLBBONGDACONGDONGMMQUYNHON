@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo FOOTBALL ACADEMY MANAGER PRO - DOCKER
echo ========================================
echo Dang build va chay app tai cong 5173...
docker compose up -d --build
echo.
echo Neu khong loi, mo trinh duyet:
echo http://localhost:5173
echo.
echo Tren dien thoai cung WiFi, mo:
echo http://IP_MAY_TINH:5173
echo.
echo Kiem tra trang thai:
docker compose ps
pause
