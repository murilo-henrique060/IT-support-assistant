const { Client, LocalAuth } = require('whatsapp-web.js');
const { SupportScript } = require('./support-script/support-script.js');
const qrcode = require('qrcode-terminal');

const AUTH = !(process.env.AUTH === 'true');
const DEBUG = (process.env.DEBUG === 'true');

let script_config = require('./script-config.json');

if (DEBUG) {
    var debug_users = require('./debug-users.json');
}

let supports = new Map;

let client_options = {};

if (AUTH) {
    client_options = {
        authStrategy: new LocalAuth()
    };
}

let client = new Client(client_options);

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

    if (!supports.has(msg.from)) {
        supports.set(msg.from, new SupportScript(client, msg.from, script_config));
    }
    
    let done = await supports.get(msg.from).run(msg);

    if (done) {
        supports.delete(msg.from);
    }
});

client.initialize();