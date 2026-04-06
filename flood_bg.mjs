import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processIcons() {
  const files = [{in: 'img3.png', out: 'pickup.png'}, {in: 'img2.jpg', out: 'moto.png'}];
  
  for (let item of files) {
    try {
      const imgPath = path.join(__dirname, 'public', 'icons', item.in);
      const img = await Jimp.read(imgPath);
      
      const w = img.bitmap.width;
      const h = img.bitmap.height;
      const data = img.bitmap.data;
      
      // We will perform a BFS flood fill from the borders to find all background pixels
      const visited = new Uint8Array(w * h);
      const queue = [];
      
      // Enqueue all border pixels
      for (let y = 0; y < h; y++) {
        queue.push({x: 0, y});
        queue.push({x: w - 1, y});
      }
      for (let x = 0; x < w; x++) {
        queue.push({x, y: 0});
        queue.push({x, y: h - 1});
      }
      
      let head = 0;
      while (head < queue.length) {
        const {x, y} = queue[head++];
        if (x < 0 || x >= w || y < 0 || y >= h) continue;
        
        const i = y * w + x;
        if (visited[i]) continue;
        
        const idx = i << 2;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        
        // Background color logic: light grey to white 
        // If it's a very light color, treat as background
        if (r > 200 && g > 200 && b > 200) {
          visited[i] = 1;
          data[idx+3] = 0; // Make transparent
          
          queue.push({x: x+1, y});
          queue.push({x: x-1, y});
          queue.push({x, y: y+1});
          queue.push({x, y: y-1});
        }
      }
      
      // Optional: feathering edge
      
      const outPath = path.join(__dirname, 'public', 'icons', item.out);
      await img.write(outPath);
      console.log('Processed floodfill transparency:', item.out);
    } catch(e) {
      console.error(item.in, e);
    }
  }
}

processIcons().catch(console.error);
