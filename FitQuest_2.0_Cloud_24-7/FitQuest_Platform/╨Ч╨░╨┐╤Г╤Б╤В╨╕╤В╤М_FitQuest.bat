@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
echo ======================================
echo       FitQuest 2.0 - запуск
 echo ======================================
where docker >nul 2>nul
if errorlevel 1 (
  echo Docker не найден. Установи Docker Desktop и запусти его.
  echo Инструкция находится в README.md
  pause
  exit /b 1
)
docker info >nul 2>nul
if errorlevel 1 (
  echo Docker установлен, но не запущен. Открой Docker Desktop и повтори.
  pause
  exit /b 1
)
echo Запускаю сервер и PostgreSQL. Первый запуск скачает необходимые образы.
docker compose up --build
pause
