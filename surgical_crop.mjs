import { Jimp } from 'jimp';

async function perfectCrop() {
    const img = await Jimp.read('public/icons/auto.png');
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // 1. Flood fill pure black (0,0,0) to transparent
    const visited = new Uint8Array(width * height);
    const stack = [[0,0], [width-1,0], [0,height-1], [width-1,height-1]];
    
    while(stack.length > 0) {
        const [x,y] = stack.pop();
        const pos = y * width + x;
        const idx = pos * 4;
        
        visited[pos] = 1;
        img.bitmap.data[idx+3] = 0; // Transparent
        
        const neighbors = [[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
        for(let [nx,ny] of neighbors) {
            if(nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const npos = ny * width + nx;
                if(visited[npos] === 0) {
                    const nidx = npos * 4;
                    const r = img.bitmap.data[nidx];
                    const g = img.bitmap.data[nidx+1];
                    const b = img.bitmap.data[nidx+2];
                    const a = img.bitmap.data[nidx+3];
                    // Flood fill threshold: very strict near-black
                    if(a > 0 && r < 12 && g < 12 && b < 12) {
                        visited[npos] = 1;
                        stack.push([nx,ny]);
                    }
                }
            }
        }
    }

    // 2. Chop bottom 18% completely
    const cropY = Math.floor(height * 0.82);
    img.scan(0, cropY, width, height - cropY, function(x,y,idx) {
        this.bitmap.data[idx+3] = 0;
    });

    // 3. Smart erase dark gray floor in the lower half
    const midY = Math.floor(height * 0.55);
    img.scan(0, midY, width, cropY - midY, function(x,y,idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx+1];
        const b = this.bitmap.data[idx+2];
        const a = this.bitmap.data[idx+3];
        // If pixel is dark gray (not pure black tires, not white car)
        if (a > 0 && r > 10 && r < 45 && g > 10 && g < 45 && b > 10 && b < 45) {
             this.bitmap.data[idx+3] = 0;
        }
    });

    // Flip to face left 
    img.flip({horizontal: true, vertical: false});

    await img.write('public/icons/cross_surgical.png');
    console.log('Saved cross_surgical.png');
}
perfectCrop().catch(console.log);
