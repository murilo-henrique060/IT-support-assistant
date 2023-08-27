class Connection {
	constructor(participants, id, script, data) {
		this.id = id;
		this.script = script;
		this.data = data;

		if (typeof participants === 'string') {
			this.participants = [participants];
		} else {
			this.participants = participants;
		}
	}

	async send(msg) {
		if (this.participants.includes(msg.from)) {
			let contact = this.msg.getContact();
			let name = contact.pushname;
			let number = await contact.getFormattedNumber();

			let message = `${msg.from} - ${name} - ${number}\n${msg.body}`;

			this.script.client.sendMessage(this.id, message);
		}
	} 
}

module.exports = { Connection };