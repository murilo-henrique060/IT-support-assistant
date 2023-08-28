const { MessageMedia } = require('whatsapp-web.js');
const { Step } = require('./step');

class Media extends Step {
	constructor(supportScript, data) {
		super(supportScript, data);

		this.caption = data.caption || '';

		this.from = data.from;
		this.path = data.path;

		this.captionKey = data.captionKey;
		this.key = data.key;
	}

	async run() {
		let caption = this.replaceVariables(this.caption);
		let path = this.replaceVariables(this.path);

		if (this.captionKey) {
			caption = this.getOption(caption, this.captionKey);
			caption = this.replaceVariables(caption);
		}

		if (this.key) {
			path = this.getOption(path, this.key);
			path = this.replaceVariables(path);
		}

		let media = '';

		if (this.from === 'path') {
			media = MessageMedia.fromFilePath(path);

		} else if (this.from === 'url') {
			media = await MessageMedia.fromUrl(path, {'unsafeMime': true});
		}

		await this.sendMessage(caption, {'media': media});
		this.nextStep();
	}
}

module.exports = { Media };