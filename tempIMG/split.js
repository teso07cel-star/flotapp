const Jimp = require('jimp');

async function processImages() {
  const mediaDir = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\brain\\5d27c937-8b9f-4581-9b0b-96a591565096';
  const outDir = 'C:\\Users\\USUARIO\\.gemini\\antigravity\\scratch\\flota-app\\public\\icons';

  // Helper to remove light backgrounds
  const removeBackground = (image) => {
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is light grayish/white (> 210 in R,G,B)
      if (red > 210 && green > 210 && blue > 210) {
        this.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });
    return image;
  };

  try {
    // 1. Double Badge -> Split into Etios and Hilux
    const doubleBadge = await Jimp.read(`${mediaDir}\\media__1775170658101.png`);
    const width = doubleBadge.bitmap.width;
    const height = doubleBadge.bitmap.height;

    const etios = doubleBadge.clone().crop(0, 0, width / 2, height);
    const hilux = doubleBadge.clone().crop(width / 2, 0, width / 2, height);

    await removeBackground(etios).writeAsync(`${outDir}\\etios.png`);
    await removeBackground(hilux).writeAsync(`${outDir}\\pickup.png`);
    console.log("Splitted and cleaned double badge!");

    // 2. White SUV (Corolla Cross)
    const suv = await Jimp.read(`${mediaDir}\\media__1775170648281.jpg`);
    await removeBackground(suv).writeAsync(`${outDir}\\auto.png`);
    console.log("Processed SUV!");

    // 3. Moto
    const moto = await Jimp.read(`${mediaDir}\\media__1775170657907.jpg`);
    // Threshold for moto might need to be higher because it has white background
    moto.scan(0, 0, moto.bitmap.width, moto.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      if (red > 230 && green > 230 && blue > 230) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    await moto.writeAsync(`${outDir}\\moto.png`);
    console.log("Processed Moto!");
    
  } catch(e) {
    console.error(e);
  }
}

processImages();
