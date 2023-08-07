class Link {
    constructor(script, data) {
        this.script = script;

        this.text = data.text;

        this.key = data.key;
    }

    async run() {
        let text = this.text;

        if (this.key) {
            text = this.text[this.script.variables[this.key]];
        }

        await this.script.client.sendMessage(this.script.id, text, { linkPreview: true });
        this.script.scriptCounter++;
    }
}

module.exports = { Link };