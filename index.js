const { Client, LocalAuth } = require('whatsapp-web.js');
const { Support } = require('./support.js');
const qrcode = require('qrcode-terminal');

var debug_users = require('./debug-users.json');

const AUTH = !(process.env.AUTH === 'true');
const DEBUG = (process.env.DEBUG === 'true');

let client = null;

let supports = new Map;

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

client.on('auth_failure', () => {
    console.log('Authentication Failed');
});

client.on('ready', async () => {
    let username = client.info.pushname;
    let phone = await client.getFormattedNumber(client.info.wid._serialized);
    console.log('Connected with', phone, 'as', username);
});

client.on('message', async msg => {
    if (DEBUG) {
        if (!debug_users.includes(msg.from)) {
            return;
        }
    }

    let done = false;

    if (supports.has(msg.from)) {
        done = await supports.get(msg.from).on_message(msg);
    } else {
        supports.set(msg.from, new Support(msg, client));
        done = await supports.get(msg.from).on_message(msg);
    }

    if (done) {
        supports.delete(msg.from);
    }
});

client.initialize();