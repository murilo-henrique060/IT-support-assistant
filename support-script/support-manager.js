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

	handleSupport(msg) {
		if (!this.supports.has(msg.from)) {
			this.supports.set(msg.from, new SupportScript(msg.from, this));
		}

		this.supports.get(msg.from).onMessage(msg);
	}

	async onMessage(msg) {
		if (DEBUG) {
			if (!DEBUGERS.includes(msg.from)){
				return;	
			}
		}

		let chat = msg.getChat();

		if (chat.isGroup) {
			return;
		} else {
			this.handleSupport(msg);
		}

	} 
}

module.exports = { SupportManager };