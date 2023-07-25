const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const AUTH = !(process.env.AUTH === 'true');

let client = null;

if (AUTH) {
    client = new Client({
        authStrategy: new LocalAuth()
    });

} else {
    client = new Client();
}

client.on('qr', (qr) => {
    console.log('Scan the QR code to login.');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('Client Authenticated!');
});

client.on('auth_failure', () => {
    console.log('Authentication Failed');
});

client.on('ready', () => {
    console.log('Listening...!');
});

client.on('message', msg => {
    client.sendMessage(msg.from, 'Olá, eu sou um bot!');
});

client.initialize();