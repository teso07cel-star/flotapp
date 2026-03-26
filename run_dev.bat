@echo off
set PORT=3000
echo Limpiando procesos en el puerto %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Iniciando FLOTAPP...
echo.
echo Una vez que diga "Ready", abre http://localhost:%PORT% en tu navegador.
echo.
"C:\Users\USUARIO\AppData\Local\ms-playwright-go\1.50.1\node.exe" node_modules\next\dist\bin\next dev -H 0.0.0.0
pause
