class Input {
    constructor(script, data) {
        this.script = script;

        this.dest = data.dest;
    }

    async run() {
        await this.script.client.sendMessage(this.script.id, this.text);

        this.script.listening = true;
    }

    async input(msg) {
        let input = msg.body.trim();

        this.script.variables[this.dest] = input;

        this.script.listening = false;
        this.script.script_counter++;
    }
}

module.exports = { Input };