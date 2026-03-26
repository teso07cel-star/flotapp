@echo off
cd /d "%~dp0"
echo [DEBUG] Directorio actual fijado en: %CD%
echo [DEBUG] Iniciando script... la ventana NO deberia cerrarse sola.
echo.

set NODE_EXE="C:\Users\USUARIO\AppData\Local\ms-playwright-go\1.50.1\node.exe"

echo [DEBUG] Buscando node en %NODE_EXE%...
if exist %NODE_EXE% (
    echo [OK] Node encontrado.
) else (
    echo [AVISO] Node no encontrado en la ruta completa.
    set NODE_EXE=node
)

echo [DEBUG] Ejecutando el programa de subida...
%NODE_EXE% scripts\subir-a-github.mjs

echo.
echo ========================================================
echo   FIN DEL PROCESO. La ventana se quedara abierta aqui.
echo ========================================================
pause
