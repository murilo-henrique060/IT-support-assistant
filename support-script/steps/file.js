const { MessageMedia } = require('whatsapp-web.js');
const { Media } = require('./media');

class File extends Media {
	constructor(supportScript, data) {
		super(supportScript, data);
	}

	async run() {
		let caption = this.replaceVariables(this.caption);
		let path = this.replaceVariables(this.path);

		if (this.captionKeyt) {
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

		await this.sendMessage(caption, {'media': media, 'sendMediaAsDocument': true});
		this.nextStep();
	}
}

module.exports = { File };