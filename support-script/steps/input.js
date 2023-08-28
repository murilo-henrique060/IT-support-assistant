const { Step } = require('./step');

class Input extends Step {
	constructor(supportScript, step) {
		super(supportScript, step);

		this.text = step.text;
		
		this.dest = step.dest;
		this.options = step.options;
		this.key = step.key;
	}

	async run() {
		let message = '';

		if (this.text !== undefined) {
			message += this.text;
		}

		if (this.options !== undefined) {
			let options = this.replaceVariables(this.options);

			if (this.key !== undefined) {
				options = this.getOption(options, this.key);
			}

			if (message != '') {
				message += '\n';
			}

			if (options === undefined) {
				throw new Error(`Option "${this.key}" not defined.`);
			}

			for (let [i, v] of Object.entries(options)) {
				message += `  ${parseInt(i) + 1} - ${this.replaceVariables(v)}\n`;
			}
		}

		if (message !== '') {
			this.sendMessage(message);
		}

		this.listen();
	}

	async input(msg) {
		if (this.dest === undefined) {
			throw new Error('Destino não definido.');
		}

		let input = msg.body.trim();

		if (this.options !== undefined) {

			let options = this.replaceVariables(this.options);

			if (this.key !== undefined) {
				options = this.getOption(options, this.key);
			}

			if (isNaN(input)) {
				await this.sendMessage('Por favor, digite um número.');
				return;
			}

			let index = parseInt(input) - 1;

			if (index < 0 || index >= options.length) {
				await this.sendMessage('Por favor, digite um índice válido.');
				return;
			}

			this.setVariable(this.dest, this.replaceVariables(options[index]));

		} else {
			this.setVariable(this.dest, input);
		}

		this.stopListen();
		this.nextStep();
	}
}

module.exports = { Input };