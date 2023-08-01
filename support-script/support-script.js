const { Text } = require("./text");
const { Input } = require("./input");
const { Select } = require("./select");
const { Contact } = require("./contact");

class SupportScript {
    constructor(client, id, scriptConfig) {
        this.client = client;
        this.id = id;
        this.number = client.getFormattedNumber(id);

        this.messages = [];

        this.script = [];
        this.variables = {};

        this.listening = false;
        this.script_counter = 0;

        this.load(scriptConfig);
    }

    load(scriptConfig) {
        for (let i = 0; i < scriptConfig.script.length; i++) {
            let step = scriptConfig.script[i];

            switch (step.type) {
                case 'text':
                    this.script.push(new Text(this, step));
                    break;

                case 'input':
                    this.script.push(new Input(this, step));
                    break;

                case 'select':
                    this.script.push(new Select(this, step));
                    break;

                case 'contact':
                    this.script.push(new Contact(this, step));
                    break;
            }
        }
    }

    async run(msg) {
        let step = this.script[this.script_counter];

        if (this.listening) {
            step.input(msg);
        }
        
        while (this.script_counter < this.script.length && !this.listening) {
            step = this.script[this.script_counter];

            await step.run();
        }

        let finished = this.script_counter >= this.script.length;

        return finished;
    }
}

module.exports = { SupportScript };