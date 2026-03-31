import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  let browser;
  try {
    console.log("Iniciando Puppeteer...");
    browser = await puppeteer.launch({ 
      headless: "new",
      defaultViewport: { width: 414, height: 896 }
    });
    const page = await browser.newPage();
    
    // Paso 1: Home
    console.log("Visitando Home...");
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(__dirname, 'public', 'tutorial_1.png') });

    // Set Driver Cookie
    await page.setCookie({ name: 'driver_name', value: 'VideoTest', domain: 'localhost' });

    // Paso 2: Entry form
    console.log("Visitando Entry...");
    await page.goto('http://localhost:3000/driver/entry');
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(__dirname, 'public', 'tutorial_2.png') });

    // Navegación directa al form de Inicio (Evitar clics con server actions)
    console.log("Navegando al form del primer viaje...");
    await page.goto('http://localhost:3000/driver/form?patente=INT01');
    await new Promise(r => setTimeout(r, 4000)); 

    // Paso 3: First Trip Form
    console.log("Tomando captura del primer viaje...");
    await page.screenshot({ path: path.join(__dirname, 'public', 'tutorial_3.png') });

    // Llenar KM y submit
    console.log("Registrando inicio de turno...");
    await page.evaluate(() => {
      document.querySelector('input[name="kmActual"]').value = '50010';
      document.querySelector('button[type="submit"]').click();
    });
    // The submit initiates a redirect to /?success=true
    await new Promise(r => setTimeout(r, 4000));

    // Volver para la parada (Navegación directa, el backend calculará !!isFirstLog && !isFinishingShift)
    console.log("Volviendo al entry para el segundo paso...");
    await page.goto('http://localhost:3000/driver/form?patente=INT01');
    await new Promise(r => setTimeout(r, 4000));

    // Paso 4: Second Trip Screen
    console.log("Tomando captura de parada/cierre...");
    await page.screenshot({ path: path.join(__dirname, 'public', 'tutorial_4.png') });

    // Click Finalizar Turno (Buscar el botón rojo por texto)
    console.log("Desplegando cierre de turno...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btnTurno = btns.find(b => b.textContent && b.textContent.includes('Finalizar Turno'));
      if (btnTurno) btnTurno.click();
    });
    
    // Paso 5: Finalizar Turno Screen
    await new Promise(r => setTimeout(r, 1500));
    // Hacemos scroll abajo
    await page.evaluate(() => window.scrollBy(0, 500));
    await new Promise(r => setTimeout(r, 1000));
    console.log("Tomando captura final...");
    await page.screenshot({ path: path.join(__dirname, 'public', 'tutorial_5.png') });

    console.log("¡Todas las capturas generadas con éxito!");
  } catch (err) {
    console.error("Error capturando:", err);
  } finally {
    if (browser) await browser.close();
  }
})();
