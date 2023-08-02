const { Text } = require("./text");
const { Input } = require("./input");
const { Select } = require("./select");
const { Contact } = require("./contact");

class SupportScript {
    constructor(client, id, scriptConfig, supportQueue) {
        this.client = client;
        this.queue = supportQueue;
        this.id = id;
        this.number = client.getFormattedNumber(id);

        this.messages = [];

        this.script = [];
        this.variables = {};

        this.listening = false;
        this.scriptCounter = 0;

        this.timeoutTimer = scriptConfig.timeout || 5;
        this.timeoutMessage = scriptConfig.timeout_message || 'Você demorou muito para responder. Por favor, inicie o atendimento novamente.';

        this.timeout = null;

        this.load(scriptConfig);
        
        this.startTimeout();
    }

    startTimeout() {
        this.timeout = setTimeout(() => {
            this.client.sendMessage(this.id, this.timeoutMessage);
            this.queue.delete(this.id);
        }, this.timeoutTimer * 60 * 1000);
    }

    resetTimeout() {
        this.closeTimeout();
        this.startTimeout();
    }

    closeTimeout() {
        clearTimeout(this.timeout);
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

        return this.script;
    }

    async run(msg) {
        this.resetTimeout();

        let step = this.script[this.scriptCounter];

        if (this.listening) {
            step.input(msg);
        }
        
        while (this.scriptCounter < this.script.length && !this.listening) {
            step = this.script[this.scriptCounter];

            await step.run();
        }

        let finished = this.scriptCounter >= this.script.length;

        return finished;
    }
}

module.exports = { SupportScript };