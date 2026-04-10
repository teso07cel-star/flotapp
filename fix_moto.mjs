import { Jimp } from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  fs.copyFileSync(path.join(__dirname, 'public/icons/img2.jpg'), path.join(__dirname, 'public/icons/moto.png'));
  const imgPath = path.join(__dirname, 'public', 'icons', 'moto.png');
  const img = await Jimp.read(imgPath);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const data = img.bitmap.data;
  
  const visited = new Uint8Array(w * h);
  const q = [];
  
  for(let y=0; y<h; y++){ q.push({x:0,y}); q.push({x:w-1,y}); }
  for(let x=0; x<w; x++){ q.push({x,y:0}); q.push({x,y:h-1}); }
  
  let head=0;
  while(head < q.length){
    const {x,y} = q[head++];
    if(x<0||x>=w||y<0||y>=h) continue;
    const i = y*w+x;
    if(visited[i]) continue;
    const idx = i<<2;
    if(data[idx]>180 && data[idx+1]>180 && data[idx+2]>180){
       visited[i]=1; data[idx+3]=0;
       q.push({x:x+1,y}); q.push({x:x-1,y}); q.push({x,y:y+1}); q.push({x,y:y-1});
    }
  }

  for(let y=Math.floor(h*0.3); y<h; y++) {
    for(let x=0; x<w; x++) {
       const idx = (y*w+x)<<2;
       if (data[idx+3]>0 && data[idx]>230 && data[idx+1]>230 && data[idx+2]>230) {
          data[idx+3] = 0;
       }
    }
  }
  
  await img.write(imgPath);
  console.log('Moto wheels fixed correctly.');
}
run();
