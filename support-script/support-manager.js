const DEBUG = (process.env.DEBUG === 'true');
const DEBUGERS = require('../debuggers.json');
const DEFAULT_SCRIPT = require('./default-script.json');
const { SupportScript } = require('./support-script');

class SupportManager{
	constructor(client, scriptConfig) {
		this.supports = new Map();
		this.connections = new Map();

		this.scriptConfig = scriptConfig || DEFAULT_SCRIPT;

		this.client = client;
	}

	async handleSupport(id, msg) {
		if (!this.supports.has(id)) {
			this.supports.set(id, new SupportScript(id, this));
		}

		await this.supports.get(id).onMessage(msg);
	}

	async handleConnection(id, msg) {
		await this.connections.get(id).response(msg);
	}

	async onMessage(msg) {
		if (msg.isStatus) {
			return;
		}

		let chat = await msg.getChat();
		let id = chat.id._serialized;

		if (chat.isGroup) {
			if (this.connections.has(id)) {
				await this.handleConnection(id, msg);
			}
		} else {
			if (DEBUG) {
				if (!DEBUGERS.includes(msg.from)){
					return;	
				}
			}

			await this.handleSupport(id, msg);
		}

	} 
}

module.exports = { SupportManager };