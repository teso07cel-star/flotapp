import { Jimp } from 'jimp';

async function processBg() {
    const img = await Jimp.read('public/icons/auto.png');
    const width = img.bitmap.width;
    const height = img.bitmap.height;
    const visited = new Uint8Array(width * height);
    
    // Push the four corners as starting points for the flood fill
    const stack = [[0, 0], [width-1, 0], [0, height-1], [width-1, height-1]];
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const pos = y * width + x;
        const idx = pos * 4;
        
        visited[pos] = 1;
        img.bitmap.data[idx + 3] = 0; // set pixel to fully transparent
        
        const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        for (let [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const npos = ny * width + nx;
                if (visited[npos] === 0) {
                    const nidx = npos * 4;
                    const r = img.bitmap.data[nidx];
                    const g = img.bitmap.data[nidx+1];
                    const b = img.bitmap.data[nidx+2];
                    const a = img.bitmap.data[nidx+3];
                    // Strict threshold to eat only the pitch-black background
                    if (a > 0 && r < 10 && g < 10 && b < 10) {
                        visited[npos] = 1;
                        stack.push([nx, ny]);
                    }
                }
            }
        }
    }

    await img.write('public/icons/cross_tactic_final.png');
    console.log('Success, background removed via flood fill.');
}
processBg().catch(console.error);
