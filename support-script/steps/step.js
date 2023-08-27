class Step {
	constructor(supportScript, step) {
		this.supportScript = supportScript;
		this.step = step;
	}

	async run() {
		this.listen();
	}

	async input() {
		this.stopListen();
		this.nextStep();
	}

	async sendMessage(msg, options = {}) {
		let message = await this.supportScript.manager.client.sendMessage(this.supportScript.id, msg, options);

		this.supportScript.messsages.push({
			'from': 'bot',
			'message': msg,
			'time': new Date(message.timestamp * 1000).toLocaleString()
		});
	}

	nextStep() {
		this.supportScript.scriptCounter++;
	}

	listen() {
		this.supportScript.listening = true;
	}

	stopListen() {
		this.supportScript.listening = false;
	}

	replaceVariables(data) {
		return this.supportScript.replaceVariables(data);
	}

	loadScript(script) {
		return this.supportScript.loadScript(script);
	}

	getVariable(key) {
		let value = this.supportScript.variables[key] || key;

		if (value === undefined) {
			throw new Error(`Variável ${key} não encontrada.`);
		}
		
		return value;
	}

	setVariable(key, value) {
		this.supportScript.variables[key] = value;
	}

	getOption(options, key) {
		return options[this.getVariable(key)];
	}
}

module.exports = { Step };