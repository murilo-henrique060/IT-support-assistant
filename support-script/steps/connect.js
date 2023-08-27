class Connect {
    constructor(script, data) {
        this.script = script;

        this.key = data.key;

        this.group = data.group;

        this.connection = null;
    }

    async run() {
        if (this.connection) {
            return;
        }

        let group = this.group;

        if (this.key) {
            group = this.group[this.script.variables[this.key]];
        }

        group = this.script.substituteVariables(group);

        

        this.script.listening = true;
    }
}

module.exports = { Connect };