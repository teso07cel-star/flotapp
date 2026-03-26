const net = require('net');

const host = 'db.siqxydghsjmvmjgkmvps.supabase.co';
const port = 6543;

const client = new net.Socket();
client.setTimeout(5000);

console.log(`Connecting to ${host}:${port}...`);

client.connect(port, host, () => {
    console.log('Connected!');
    client.destroy();
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
    client.destroy();
});

client.on('timeout', () => {
    console.error('Connection timed out');
    client.destroy();
});
