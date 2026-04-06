import { Jimp } from 'jimp';

async function createTacticAssets() {
    try {
        console.log('Processing etios...');
        const etios = await Jimp.read('public/icons/etios.png');
        const eh = etios.bitmap.height;
        etios.scan(0, Math.floor(eh * 0.65), etios.bitmap.width, Math.floor(eh * 0.35), function(x, y, idx) {
            this.bitmap.data[idx+3] = 0;
        });
        await etios.write('public/icons/etios_tactic.png');

        console.log('Processing moto...');
        const moto = await Jimp.read('public/icons/moto.png');
        const mh = moto.bitmap.height;
        moto.scan(0, Math.floor(mh * 0.70), moto.bitmap.width, Math.floor(mh * 0.30), function(x, y, idx) {
            const r = this.bitmap.data[idx];
            const g = this.bitmap.data[idx+1];
            const b = this.bitmap.data[idx+2];
            const a = this.bitmap.data[idx+3];
            if (a > 10 && r > 90 && g > 90 && b > 90) {
                this.bitmap.data[idx] = 10;
                this.bitmap.data[idx+1] = 10;
                this.bitmap.data[idx+2] = 10;
                this.bitmap.data[idx+3] = Math.min(a, 200); 
            }
        });
        await moto.write('public/icons/moto_tactic.png');

        console.log('Processing pickup...');
        const pickup = await Jimp.read('public/icons/pickup.png');
        pickup.flip({ horizontal: true, vertical: false });
        await pickup.write('public/icons/pickup_tactic.png');

        console.log('Done rendering assets.');
    } catch(e) {
        console.error(e);
    }
}
createTacticAssets();
