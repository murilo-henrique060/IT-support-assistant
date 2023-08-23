class Input {
    constructor(script, data) {
        this.script = script;

        this.text = data.text;

        this.dest = data.dest;
    }

    async run() {
        let text = this.script.substituteVariables(this.text);

        await this.script.client.sendMessage(this.script.id, text);

        this.script.listening = true;
    }

    async input(msg) {
        let input = msg.body.trim();

        this.script.variables[this.dest] = input;

        this.script.listening = false;
        this.script.scriptCounter++;
    }
}

module.exports = { Input };