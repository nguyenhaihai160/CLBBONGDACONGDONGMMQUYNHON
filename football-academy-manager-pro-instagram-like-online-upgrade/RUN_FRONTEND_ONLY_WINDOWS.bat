@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo CHAY GIAO DIEN FRONTEND DEV
echo ========================================
echo Luu y: cach nay chi chay giao dien. Backend/API nen chay bang Docker.
call npm --prefix frontend install
call npm --prefix frontend run dev -- --host 0.0.0.0
pause
