import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processIcons() {
  const files = ['img1.png', 'img2.jpg']; // Hilux, Moto from user uploads
  for (let file of files) {
    try {
      const imgPath = path.join(__dirname, 'public', 'icons', file);
      const img = await Jimp.read(imgPath);
      
      // Make white pixels transparent
      img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        if (r > 240 && g > 240 && b > 240) {
          this.bitmap.data[idx + 3] = 0; // set alpha to 0
        }
      });
      
      const outPath = path.join(__dirname, 'public', 'icons', 'transparent_' + file + '.png');
      await img.write(outPath);
      console.log('Processed', file);
    } catch(e) {
      console.error(file, e);
    }
  }
}

processIcons().catch(console.error);
