class If {
    constructor(script, data) {
        this.script = script;

        this.options = data.options;

        this.key = data.key;
    }
  
    async run() {
        let key = this.script.substituteVariables(this.key);

        let nScript = this.options[key];

        if (nScript) {
            let cScript = this.script.loadScript(nScript);
            
            for (let i in cScript) {
                this.script.script.splice(this.script.scriptCounter + 1 + i, 0, cScript[i]);
            }
        }

        this.script.scriptCounter++;
    }
}

module.exports = { If };