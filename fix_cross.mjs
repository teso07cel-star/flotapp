import { Jimp } from 'jimp';

async function processCross() {
    const img = await Jimp.read('public/icons/cross_tactic_final.png');
    const height = img.bitmap.height;
    const width = img.bitmap.width;

    // Erase bottom 23% to cut off the dark gray floor blob
    const eraseHeight = Math.floor(height * 0.23); 
    img.scan(0, height - eraseHeight, width, eraseHeight, function(x, y, idx) {
        this.bitmap.data[idx + 3] = 0; // Alpha 0
    });

    // We also want to erase any remaining light gray pixels around the edges in the bottom half
    // to be absolutely sure no ragged edges stay floating
    img.scan(0, height / 2, width, height / 2, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const a = this.bitmap.data[idx+3];
        // If it's a very dark pixel (part of the floor reflection that the floodfill missed)
        if (a > 0 && r < 20) {
            // we won't blindly erase all dark pixels because the tires are dark.
            // But we already cropped the bottom 23%.
        }
    });

    // Flip horizontally to face left ("para el otro lado")
    img.flip({ horizontal: true, vertical: false });

    await img.write('public/icons/cross_perfect.png');
    console.log('Saved as cross_perfect.png');
}
processCross().catch(console.error);
