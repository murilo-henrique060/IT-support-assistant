const { Step } = require('./step');

class If extends Step {
	constructor(supportScript, step) {
		super(supportScript, step);

		this.key = step.key;
		this.options = step.options;
		this.default = step.default || '';
	}
  
	async run() {
		let newScript = this.replaceVariables(this.options);

		if (this.key !== undefined) {
			newScript = this.getOption(newScript, this.key) || this.default;
			newScript = this.replaceVariables(newScript);
		}

		if (newScript !== '') {
			let compiledScript = this.supportScript.loadScript(newScript);
			
			this.supportScript.script.splice(this.supportScript.scriptCounter + 1, 0, ...compiledScript);
		}

		this.nextStep();
	}
}

module.exports = { If };