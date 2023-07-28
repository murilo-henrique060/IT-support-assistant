const script = require('./script.json');

class Support {
    constructor (msg, client) {
        this.client = client;

        this.messages = [msg.body];

        this.id = msg.from;
        this.number = client.getFormattedNumber(this.id);

        this.script_values = {};

        this.script_counter = 0;
        this.listening = false;
    }

    async on_message(msg) {
        this.messages.push(msg.body);
    
        let step = script[this.script_counter];
 
        if (this.listening) {
            switch (step.type) {
                case 'select':
                    this.script_values[step.dest] = step.options[parseInt(msg.body) - 1];

                    break;

                case 'selectByKey':
                    let key = null;
                    if (typeof step.key === 'string' || step.key instanceof String){
                        key = this.script_values[step.key];
                    } else if(!isNaN(step.key)) {
                        key = parseInt(step.key);
                    }

                    this.script_values[step.dest] = step.options[key][parseInt(msg.body) - 1];

                    break;
            }

            this.listening = false;
            this.script_counter++;
        }

        while (!this.listening) {
            if (this.script_counter >= script.length) {
                return true;
            }

            step = script[this.script_counter];
            switch (step.type) {
                case 'text':
                    await this.client.sendMessage(this.id, step.text);
                    this.script_counter++;
                    break;

                case 'select':
                    var message = step.text + '\n';

                    for (let i = 0; i < step.options.length; i++) {
                        message += (i + 1) + '- ' + step.options[i] + '\n';
                    }

                    await this.client.sendMessage(this.id, message);
                    this.listening = true;
                    break;

                case 'selectByKey':
                    var message = step.text + '\n';

                    var options = step.options[this.script_values[step.key]];

                    for (let i = 0; i < options.length; i++) {
                        message += (i + 1) + ' - ' + options[i] + '\n';
                    }

                    await this.client.sendMessage(this.id, message);
                    this.listening = true;
                    break;

                case 'contactOfKey':
                    var number = step.options[this.script_values[step.key]];

                    var numberId = await this.client.getNumberId(number);
                    var contact = await this.client.getContactById(numberId._serialized);
                    await this.client.sendMessage(this.id, contact);

                    this.script_counter++;
                    break;
            }
        }
    }
}

module.exports = { Support };