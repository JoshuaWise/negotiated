'use strict';

module.exports = class Parser {
	constructor(source) {
		this.source = source;
		this.index = 0;
	}
	accept({ regex, capture }) {
		regex.lastIndex = this.index;
		const match = this.source.match(regex);
		if (match) {
			this.index += match[0].length;
			return capture === -1 ? match : match[capture];
		}
		return null;
	}
	expect(pattern) {
		const result = this.accept(pattern);
		if (result !== null) return result;
		throw new Error('Malformed header value');
	}
	ended() {
		return this.index === this.source.length;
	}
};
