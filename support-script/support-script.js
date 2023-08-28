const { STEPS } = require('./steps');

const fs = require('fs');
const csv = require('csv-stringify');

const LOG_PATH = process.env.LOG_PATH || 'log.csv';

class SupportScript {
	constructor(id, manager) {
		this.id = id;

		manager.client.getFormattedNumber(id).then( number => {
			this.number = number;
		});

		manager.client.getContactById(id).then( contact => {
			this.pushname = contact.pushname;
		});

		this.manager = manager;

		this.messages = [];

		this.script = [];
		this.variables = new Map();

		this.listening = false;
		this.scriptCounter = 0;

		this.errorMessage = this.manager.scriptConfig.errorMessage || 'An error has occurred, contact the administrator.';

		this.timeoutTimer = this.manager.scriptConfig.timeoutTimer || 5;
		this.timeoutMessage = this.manager.scriptConfig.timeoutMessage || 'Você demorou muito para responder, por favor, inicie uma nova conversa.';
		this.timeout = null;

		this.load();
		this.startTimeout();
	}

	async steps() {
		while (this.scriptCounter < this.script.length && !this.listening) {
			let step = this.script[this.scriptCounter];

			await step.run();
		}

		if (this.scriptCounter >= this.script.length) {
			await this.finish();
			return true;
		}

		return false;
	}

	async onMessage(msg) {
		try {
			if (this.timeout !== null) {
				this.stopTimeout();
			}
	
			this.messages.push({
				'from': 'user',
				'message': msg.body,
				'time': new Date(msg.timstamp * 1000).toLocaleString()
			});
	
			let step = this.script[this.scriptCounter];
	
			if (this.listening) {
				step.input(msg);
			}
			
			let done = await this.steps();

			if (done) {
				return;
			}
	
			this.startTimeout();

		} catch (err) {
			console.error(err);
			this.manager.client.sendMessage(msg.from, this.errorMessage);
			await this.finish('script error' + err.message);
		}
	}

	async finish(status='script finished') {
		if (this.timeout !== null) {
			this.stopTimeout();
		}

		for (let connection of this.manager.connections.values()) {
			if (connection.users.has(this.id)) {
				await connection.removeUser(this);
			}
		}
        
		let currentDate = new Date();

		let l = [
			currentDate.valueOf(),
			currentDate.toLocaleString(),
			await this.manager.client.getFormattedNumber(this.id),
			await this.manager.client.getContactById(this.id).pushname,
			status,
			this.messages
		];

		try {
			fs.accessSync(LOG_PATH, fs.constants.F_OK);

		} catch (err) {
			await csv.stringify([['timestamp', 'date', 'phone', 'name', 'status', 'messages']], (err, output) => {
				fs.appendFileSync(LOG_PATH, output);		
			});
		}

		await csv.stringify([l], (err, output) => {
			fs.appendFileSync(LOG_PATH, output);		
		});
		
		this.manager.supports.delete(this.id);
	}
	
	startTimeout() {
		this.timeout = setTimeout(() => {
			this.manager.client.sendMessage(this.id, this.timeoutMessage);
			this.finish('user timeout');
		}, this.timeoutTimer * 60 * 1000);
	}

	stopTimeout() {
		clearTimeout(this.timeout);
		this.timeout = null;
	}

	load() {
		if ('variables' in this.manager.scriptConfig) {
			for (let [k, v] of Object.entries(this.manager.scriptConfig.variables)) {
				this.variables.set(k, v);
			}
		}
        
		this.script = this.loadScript(this.manager.scriptConfig.script);
	}

	loadScript(script) {
		let newScript = [];

		for (let step of script) {
			if (step.type in STEPS) {
				newScript.push(new STEPS[step.type](this, step));
			}
		}

		return newScript;
	}

	replaceVariables(data) {
		switch (typeof data) {
		case 'object':
		{
			if (data instanceof Array) {
				let response = [];

				for (let item of data) {
					response.push(this.replaceVariables(item));
				}

				return response;
			} else {
				let response = {};

				for (let [i, v] of Object.entries(data)) {
					response[this.replaceVariables(i)] = this.replaceVariables(v);
				}

				return response;
			}
		}
		
		case 'string': 
		{
			let response = '';

			response = data.replaceAll(/\$\{([a-zA-Z0-9_]+\})/gi, (match) => {
				let key = match.substring(2, match.length - 1);
				
				if (this.variables.has(key)) {
					return this.variables.get(key);
				} else {
					return match;
				}
			});

			return response;
		}

		default:
		{
			return data;
		}
		}
	}
}

module.exports = { SupportScript };