const { Client, LocalAuth } = require('whatsapp-web.js');
const { SupportManager } = require('./support-script/support-manager.js');
const qrCode = require('qrcode-terminal');

const AUTH = (process.env.AUTH === 'true' || process.env.AUTH === undefined);

var client = null;

if (AUTH) {
	client = new Client({
		authStrategy: new LocalAuth()
	});
} else {
	client = new Client();
}
const supportManager = new SupportManager(client);

client.on('qr', (qr) => {
	console.log('Scan the QR code to login.');
	qrCode.generate(qr, { small: true });
});

client.on('auth_failure', () => {
	console.log('Authentication Failed');
});

client.on('ready', async () => {
	const username = client.info.pushname;
	const phone = await client.getFormattedNumber(client.info.wid._serialized);
	console.log('Connected with', phone, 'as', username);
});

client.on('message', async msg => {
	supportManager.onMessage(msg);
});

client.initialize();
