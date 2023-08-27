const { Text } = require('./text');

class Link extends Text {
	constructor(supportScript, step) {
		super(supportScript, step);
	}

	async run() {
		let text = this.replaceVariables(this.text);

		if (this.key !== undefined) {
			text = this.getOption(text, this.key) || this.replaceVariables(this.notDefined);
			text = this.replaceVariables(text);
		}

		await this.sendMessage(text, { linkPreview: true });
		this.nextStep();
	}
}

module.exports = { Link };