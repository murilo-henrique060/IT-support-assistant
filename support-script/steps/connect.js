const { Step } = require('./step');
const { Connection } = require('../connection');

class Connect extends Step {
	constructor(scriptConfig, step) {
		super(scriptConfig, step);

		this.text = step.text || '';

		this.key = step.key;
		this.options = step.options;

		this.with = step.with || 'group';
		this.headers = step.headers || {};

		this.connection;
	}

	async run() {
		if (this.with == 'group') {
			if (this.text !== '') {
				this.text = this.replaceVariables(this.text);
				await this.sendMessage(this.text);
			}

			let options = this.replaceVariables(this.options);

			if (this.key !== undefined) {
				options = this.getOption(options, this.key);
				options = this.replaceVariables(options);
			}

			let groupId;
			let chats = await this.supportScript.manager.client.getChats();
			let groups = chats.filter((chat) => chat.isGroup);
			for (let group of groups) {
				if (group.name == options) {
					groupId = group.id._serialized;
					break;
				}
			}

			if (groupId === undefined) {
				throw new Error(`Grupo ${options} não encontrado.`);
			}

			let headers = this.replaceVariables(this.headers);

			if (headers['contato'] === undefined) {
				headers['contato'] = this.supportScript.number;
			}

			if (!this.supportScript.manager.connections.has(groupId)){
				this.supportScript.manager.connections.set(groupId, new Connection(groupId, this.supportScript.manager, this.supportScript, headers));

			} else {
				this.supportScript.manager.connections.get(groupId).addUser(this.supportScript, headers);
			}

			this.connection = this.supportScript.manager.connections.get(groupId);

		} else {
			this.nextStep();
		}

		this.listen();
	}

	async input(msg) {
		if (this.with == 'group') {
			let headers = this.replaceVariables(this.headers);

			if (headers['contato'] === undefined) {
				headers['contato'] = this.supportScript.number;
			}

			this.connection.send(this.supportScript, msg.body, headers);
		}
	}
}

module.exports = { Connect };