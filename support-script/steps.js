const { Text } = require('./steps/text');
const { Link } = require('./steps/link');
const { Input } = require('./steps/input');
const { Contact } = require('./steps/contact');
const { If } = require('./steps/if');
const { Media } = require('./steps/media');
const { File } = require('./steps/file');
const { Connect } = require('./steps/connect');

const STEPS = {
	'text': Text,
	'link': Link,
	'input': Input,
	'contact': Contact,
	'if': If,
	'media': Media,
	'file': File,
	'connect': Connect
};

module.exports = { STEPS };