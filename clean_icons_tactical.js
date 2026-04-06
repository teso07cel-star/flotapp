const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const iconsDir = path.join(__dirname, 'public', 'icons');
const artifactDir = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\5d27c937-8b9f-4581-9b0b-96a591565096';

async function processIcons() {
  // Source clean images from artifacts (without medals)
  const sources = [
    { src: 'media__1775170648281.jpg', dest: 'pickup.png' }, // Hilux
    { src: 'media__1775170657907.jpg', dest: 'etios.png' },  // Etios
    { src: 'neon_moto_1775166377943.png', dest: 'moto.png' } // Moto
  ];

  for (const item of sources) {
    const srcPath = path.join(artifactDir, item.src);
    const destPath = path.join(iconsDir, item.dest);

    if (fs.existsSync(srcPath)) {
      console.log(`Procesando ${item.src} -> ${item.dest}`);
      const image = await Jimp.read(srcPath);
      
      // Basic cleanup: ensure transparency if needed or just save as clean PNG
      // We don't add the medals this time!
      await image.writeAsync(destPath);
      console.log(`Guardado ${item.dest}`);
    } else {
      console.log(`No se encontró fuente para ${item.src}`);
    }
  }
}

processIcons().catch(console.error);
