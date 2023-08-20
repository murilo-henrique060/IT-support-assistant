class Contact {
    constructor(script, data) {
        this.script = script;

        this.number = data.number;

        this.key = data.key;
    }

    async run() {
        let number = this.number;

        if (this.key) {
            number = this.number[this.script.variables[this.key]];
        }

        let numberId = await this.script.client.getNumberId(number);
        let contact = await this.script.client.getContactById(numberId._serialized);
        await this.script.client.sendMessage(this.script.id, contact);

        this.script.scriptCounter++;
    }
}

module.exports = { Contact };