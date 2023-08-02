class Text {
    constructor(script, data) {
        this.script = script;

        this.text = data.text;
    }

    async run() {
        await this.script.client.sendMessage(this.script.id, this.text);
        this.script.scriptCounter++;
    }
}

module.exports = { Text };