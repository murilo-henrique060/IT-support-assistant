const { Client, LocalAuth } = require('whatsapp-web.js');
const { SupportScript } = require('./support-script/support-script.js');
const qrCode = require('qrcode-terminal');

const AUTH = !(process.env.AUTH === 'true');
const DEBUG = (process.env.DEBUG === 'true');

let scriptConfig = require('./script-config.json');

if (DEBUG) {
    var debugUsers = require('./debug-users.json');
}

let supports = new Map;

let clientOptions = {};

if (AUTH) {
    clientOptions = {
        authStrategy: new LocalAuth()
    };
}

let client = new Client(clientOptions);

client.on('qr', (qr) => {
    console.log('Scan the QR code to login.');
    qrCode.generate(qr, { small: true });
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
        if (!debugUsers.includes(msg.from)) {
            return;
        }
    }

    if (!supports.has(msg.from)) {
        supports.set(msg.from, new SupportScript(client, msg.from, scriptConfig, supports));
    }
    
    let done = await supports.get(msg.from).run(msg);

    if (done) {
        supports.get(msg.from).close();
    }
});

client.initialize();