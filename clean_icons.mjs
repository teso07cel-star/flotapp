import { Jimp } from 'jimp';
import fs from 'fs';

async function cropBottom(filename, pixelsToRemove) {
    try {
        console.log(`Processing ${filename}...`);
        const image = await Jimp.read(filename);
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        
        // Scan the bottom rows and set alpha to 0
        image.scan(0, height - pixelsToRemove, width, pixelsToRemove, function(x, y, idx) {
            this.bitmap.data[idx + 3] = 0; // alpha channel
        });
        
        await image.write(filename);
        console.log(`Successfully cropped bottom ${pixelsToRemove}px from ${filename}`);
    } catch (e) {
        console.error(`Error processing ${filename}:`, e);
    }
}

async function main() {
    await cropBottom('public/icons/etios_final.png', 85);
    await cropBottom('public/icons/moto_final.png', 40);
}

main();
