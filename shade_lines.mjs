import { Jimp } from 'jimp';

async function processImages() {
    try {
        console.log('Processing moto.png...');
        const moto = await Jimp.read('public/icons/moto.png');
        const mWidth = moto.bitmap.width;
        const mHeight = moto.bitmap.height;
        
        // Scan bottom 20% of the image
        const mbPixels = Math.floor(mHeight * 0.20);
        moto.scan(0, mHeight - mbPixels, mWidth, mbPixels, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const a = this.bitmap.data[idx + 3];
            
            // If it's visible and mostly white/light-gray (artifacts)
            if (a > 20 && r > 160 && g > 160 && b > 160) {
                // Turn into dark contact shadow 
                this.bitmap.data[idx + 0] = 5;
                this.bitmap.data[idx + 1] = 5;
                this.bitmap.data[idx + 2] = 5;
                this.bitmap.data[idx + 3] = Math.min(a, 200); 
            }
        });
        await moto.write('public/icons/moto_final.png');

        console.log('Processing etios.png...');
        const etios = await Jimp.read('public/icons/etios.png');
        const eWidth = etios.bitmap.width;
        const eHeight = etios.bitmap.height;
        
        // Erase bottom 28% of the image
        const ebPixels = Math.floor(eHeight * 0.28);
        etios.scan(0, eHeight - ebPixels, eWidth, ebPixels, function(x, y, idx) {
            this.bitmap.data[idx + 3] = 0; 
        });
        await etios.write('public/icons/etios_final.png');

        console.log('Success');
    } catch (err) {
        console.error(err);
    }
}
processImages();
