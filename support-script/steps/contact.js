const { Step } = require('./step');

class Contact extends Step {
	constructor(supportScript, step) {
		super(supportScript, step);

		this.number = step.number;
		this.key = step.key;
	}

	async run() {
		let number = this.replaceVariables(this.number);

		if (this.key) {
			number = this.getOption(number, this.key);
		}

		let numberId = await this.supportScript.manager.client.getNumberId(number);
		let contact = await this.supportScript.manager.client.getContactById(numberId._serialized);
		await this.sendMessage(contact);

		this.nextStep();
	}
}

module.exports = { Contact };