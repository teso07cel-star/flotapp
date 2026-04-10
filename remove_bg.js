const { Jimp, intToRGBA } = require('jimp');

async function processImage(filename) {
    try {
        console.log("Processing", filename);
        let img;
        try {
            img = await Jimp.read(filename);
        } catch (e) {
            console.error("Failed to read", filename, e);
            return;
        }
        
        const w = img.bitmap.width;
        const h = img.bitmap.height;
        
        const visited = new Uint8Array(w * h);
        
        // Start from corners and middle edges
        const q = [
            [0, 0], [w-1, 0], [0, h-1], [w-1, h-1],
            [Math.floor(w/2), 0], [Math.floor(w/2), h-1],
            [0, Math.floor(h/2)], [w-1, Math.floor(h/2)]
        ];
        
        // VERY STRICT THRESHOLD to not eat tires
        const threshold = 5; 
        
        const isBg = (x, y) => {
            const hex = img.getPixelColor(x, y);
            const c = intToRGBA(hex);
            return c.r <= threshold && c.g <= threshold && c.b <= threshold;
        };
        
        const targetColor = 0x00000000; // Transparent
        let pxRemoved = 0;
        
        for (let point of q) {
            const [sx, sy] = point;
            if (!isBg(sx, sy)) continue;
            
            let localQ = [[sx, sy]];
            visited[sy * w + sx] = 1;
            
            while (localQ.length > 0) {
                const [cx, cy] = localQ.pop();
                img.setPixelColor(targetColor, cx, cy);
                pxRemoved++;
                
                const neighbors = [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]];
                for (let [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                        const idx = ny * w + nx;
                        if (!visited[idx]) {
                            // Check if color is close to black
                            if (isBg(nx, ny)) {
                                visited[idx] = 1;
                                localQ.push([nx, ny]);
                            }
                        }
                    }
                }
            }
        }
        
        console.log(`Processed ${filename}, removed ${pxRemoved} background pixels.`);
        await img.write(filename); // Overwrite as real PNG
    } catch (e) {
        console.error("Error processing", filename, e.message);
    }
}

async function run() {
    await processImage('public/icons/moto.png');
    await processImage('public/icons/pickup.png');
    await processImage('public/icons/auto.png');
    await processImage('public/icons/etios.png');
}

run();
