import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processIcons() {
  // Use img3 for Hilux and img2 for Moto
  const files = [{in: 'img3.png', out: 'pickup.png'}, {in: 'img2.jpg', out: 'moto.png'}];
  
  for (let item of files) {
    try {
      const imgPath = path.join(__dirname, 'public', 'icons', item.in);
      const img = await Jimp.read(imgPath);
      
      const width = img.bitmap.width;
      const height = img.bitmap.height;
      const data = img.bitmap.data;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (width * y + x) << 2;
          const r = data[idx + 0];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // distance to white
          const dist = Math.max(255-r, 255-g, 255-b);
          
          if (dist < 40) {
             // It's white or very light gray -> fully transparent
             data[idx + 3] = 0;
          } else if (dist < 80) {
             // Anti-aliasing fringe: partially transparent
             const alpha = ((dist - 40) / 40) * 255;
             data[idx + 3] = Math.min(255, Math.floor(alpha));
          }
        }
      }
      
      const outPath = path.join(__dirname, 'public', 'icons', item.out);
      await img.write(outPath);
      console.log('Processed perfect transparency:', item.out);
    } catch(e) {
      console.error(item.in, e);
    }
  }
}

processIcons().catch(console.error);
