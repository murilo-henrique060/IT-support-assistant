const { MessageMedia } = require('whatsapp-web.js');

class Connection {
	constructor(id, manager, user, headers={}) {
		this.id = id;		
		this.users = new Map();
		this.manager = manager;

		if (user !== undefined) {
			this.addUser(user, headers);
		}
	}

	async send(user, msg, headers = {}) {
		let name = headers.name || user.pushname;

		let message = `${user.id} - ${name}`;

		let options = {};

		if (typeof msg === 'string') {
			let m = '';

			for (let line of msg.split('\n')) {
				m += `\n    ${line}`;
			}

			message += m;

		} else if (msg instanceof MessageMedia) {
			options['media'] = msg;
		}

		this.manager.client.sendMessage(this.id, message, options);
	}

	async response(msg) {
		if (!msg.hasQuotedMsg) {
			return;
		}

		let quotedMsg = await msg.getQuotedMessage();

		if (!quotedMsg.fromMe) {
			return;
		}

		let userId = quotedMsg.body.split(' ')[0];

		if (!this.users.has(userId)) {
			return;
		}
		
		let user = this.users.get(userId);

		user.stopTimeout();

		if (msg.body === '@sair') {
			await this.removeUser(user);
			
			user.listening = false;
			user.scriptCounter++;

			user.steps();

			return;
		}

		let attendant = await this.manager.client.getContactById(msg.author);
		let name = attendant.name;

		let message = `${name}`;

		for (let line of msg.body.split('\n')) {
			message += `\n    ${line}`;
		}

		await this.manager.client.sendMessage(user.id, message);
		user.messages.push({
			'from': 'attendant',
			'message': msg.body,
			'time': new Date(msg.timstamp * 1000).toLocaleString()
		});

		user.startTimeout();
	}
	
	async addUser(user, headers = {}) {
		this.users.set(user.id, user);

		let message = `${user.pushname} entrou na conversa:`;

		for (let [i, v] of Object.entries(headers)) {
			message += `\n  - ${i}: ${v}`;
		}

		await this.send(user, message, headers);

		let chat = await this.manager.client.getChatById(this.id);
		let name = chat.name;

		await this.manager.client.sendMessage(user.id, `Conectado com ${name}`);
	}

	async removeUser(user) {
		this.users.delete(user.id);
		
		let message = `${user.pushname} saiu da conversa.`;

		await this.send(user, message);

		await this.manager.client.sendMessage(user.id, 'Conexão encerrada.');

		if (this.users.size == 0) {
			this.manager.connections.delete(this.id);
		}
	}
}

module.exports = { Connection };