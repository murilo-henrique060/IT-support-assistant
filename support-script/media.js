const { MessageMedia } = require('whatsapp-web.js');

class Media {
    constructor(script, data) {
        this.script = script;

        this.text = data.text;

        this.from = data.from;
        this.path = data.path;

        this.keyText = data.keyText;
        this.key = data.key;
    }

    async run() {
        let text = this.text;
        let path = this.path;

        if (this.keyText) {
            text = this.text[this.script.variables[this.keyText]];
        }

        if (this.key) {
            path = this.path[this.script.variables[this.key]];
        }

        text = this.script.substituteVariables(text);
        path = this.script.substituteVariables(path);

        let media = '';

        if (this.from === 'path') {
            media = MessageMedia.fromFilePath(path);
        } else if (this.from === 'url') {
            media = await MessageMedia.fromUrl(path, {'unsafeMime': true});
        }

        await this.script.client.sendMessage(this.script.id, text, {'media': media});
        this.script.scriptCounter++;
    }
}

module.exports = { Media };