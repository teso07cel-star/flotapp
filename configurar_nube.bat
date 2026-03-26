@echo off
setlocal
echo ===================================================
echo   ASISTENTE DE CONFIGURACION - FLOTAPP CLOUD
echo ===================================================
echo.
echo Este asistente te ayudara a conectar tu app con la nube.
echo.
echo 1. Pega aqui la "Connection String" o "DATABASE_URL" 
echo    que copiaste de Supabase o Vercel:
set /p DB_URL="URL: "

if "%DB_URL%"=="" (
    echo.
    echo ERROR: No ingresaste ninguna URL. Reintenta.
    pause
    exit /b
)

echo.
echo Guardando configuracion...
echo DATABASE_URL="%DB_URL%" > .env

echo.
echo ===================================================
echo   SUBIENDO TUS DATOS ACTUALES A LA NUBE...
echo ===================================================
"C:\Users\USUARIO\AppData\Local\ms-playwright-go\1.50.1\node.exe" scripts\migrate-to-cloud.mjs

echo.
echo ===================================================
echo   ¡TODO LISTO EN TU COMPUTADORA!
echo ===================================================
echo.
echo Ahora solo falta que subas la carpeta a GitHub 
echo y la conectes con Vercel siguiendo la guia visual.
echo.
pause
