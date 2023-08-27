const { Step } = require('./step');

class Text extends Step {
	constructor(supportScript, step) {
		super(supportScript, step);
		
		this.text = step.text;
		this.key = step.key;

		this.notDefined = step.notDefined || `${this.key} não definido. (Text)`;
	}

	async run() {
		let text = this.replaceVariables(this.text);

		if (this.key !== undefined) {
			text = this.getOption(text, this.key) || this.notDefined;
			text = this.replaceVariables(text);
		}


		await this.sendMessage(text);
		this.nextStep();
	}
}

module.exports = { Text };