const { Text } = require("./text");
const { Link } = require("./link");
const { Input } = require("./input");
const { Select } = require("./select");
const { Contact } = require("./contact");

const fs = require('fs');
const csv = require('csv-stringify');

const LOG_PATH = process.env.LOG_PATH || 'log.csv';

class SupportScript {
    constructor(client, id, scriptConfig, supportQueue) {
        this.client = client;
        this.queue = supportQueue;
        this.id = id;

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

    substituteVariables(data) {
        if (typeof data === 'object') {
            if (data instanceof Array) {
                let response = [];
    
                for (let i in data) {
                    response.push(this.substituteVariables(data[i]));
                }
    
                return response;
            } else {
                let response = {};
    
                for (let i in data) {
                    response[this.substituteVariables(i)] = this.substituteVariables(data[i]);
                }
    
                return response;
            }
        } else if (typeof data === 'number') {
            return data;
        } else if (typeof data === 'string'){
            let response = [];
    
            for (let w of data.split(' ')) {
                if (w[0] === '$') {
                    if (this.variables[w]) {
                        response.push(this.variables[w]);
                    } else {
                        response.push(w);
                    }
                } else {
                    response.push(w);
                }
            }
    
            return response.join(' ');
        }
    }

    startTimeout() {
        this.timeout = setTimeout(() => {
            this.client.sendMessage(this.id, this.timeoutMessage);
            this.close();
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
        for (let i in scriptConfig.variables) {
            this.variables[i] = scriptConfig.variables[i];
        }
        
        for (let i = 0; i < scriptConfig.script.length; i++) {
            let step = this.substituteVariables(scriptConfig.script[i]);

            switch (step.type) {
                case 'text':
                    this.script.push(new Text(this, step));
                    break;

                case 'link':
                    this.script.push(new Link(this, step));
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

        this.messages.push(msg.body);

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

    async close() {
        this.closeTimeout();
        
        let dC = new Date();

        let day = dC.getDate().toString().padStart(2, '0');
        let month = dC.getMonth().toString().padStart(2, '0');
        let year = dC.getFullYear().toString().padStart(4, '0');

        let hour = dC.getHours().toString().padStart(2, '0');
        let minute = dC.getMinutes().toString().padStart(2, '0');
        let second = dC.getSeconds().toString().padStart(2, '0');

        let date = `${day}-${month}-${year}`;
        let time = `${hour}:${minute}:${second}`;

        let number = await this.client.getFormattedNumber(this.id);

        let l = [date, time, number, this.messages];

        csv.stringify([l], (err, output) => {
            fs.appendFileSync(LOG_PATH, output);
        });

        this.queue.delete(this.id);
    }
}

module.exports = { SupportScript };