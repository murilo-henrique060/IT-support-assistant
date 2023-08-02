class Select {
    constructor(script, data) {
        this.script = script;

        this.text = data.text;

        this.dest = data.dest;
        this.key = data.key;
        this.options = data.options;
    }

    async run() {
        let message = this.text + '\n\n';

        let options = this.options;

        if (this.key) {
            options = this.options[this.script.variables[this.key]];
        }

        for (let i = 0; i < options.length; i++) {
            message += `${i + 1} - ${options[i]}\n`;
        }

        await this.script.client.sendMessage(this.script.id, message);

        this.script.listening = true;
    }

    async input(msg) {
        let input = msg.body.trim();

        if (isNaN(input)) {
            await this.script.client.sendMessage(this.script.id, 'Por favor, digite um número.');
            return;
        }

        let index = parseInt(input) - 1;

        let options = this.options;

        if (this.key) {
            options = this.options[this.script.variables[this.key]];
        }

        if (index < 0 || index >= options.length) {
            await this.script.client.sendMessage(this.script.id, 'Por favor, digite um índice válido.');
            return;
        }

        this.script.variables[this.dest] = options[index];

        this.script.listening = false;
        this.script.script_counter++;
    }
}

module.exports = { Select };