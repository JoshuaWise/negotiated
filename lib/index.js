'use strict';
const Parser = require('./parser');
const patterns = require('./patterns');
const quotedPair = /\\(.)/g;

const simpleAccept = (name, subjectPattern) => function* (header) {
	if (!header) return;
	if (typeof header !== 'string') throw new TypeError('Expected header to be a string');
	for (const parser = new Parser(header);;) {
		const subject = parser.expect(subjectPattern).toLowerCase();
		const weight = +(parser.accept(patterns.qvalue) || 1);
		yield { [name]: subject, weight };
		if (parser.ended()) return;
		parser.expect(patterns.comma);
	}
};

exports['accept'] = function* (header) {
	if (!header) return;
	if (typeof header !== 'string') throw new TypeError('Expected header to be a string');
	for (const parser = new Parser(header);;) {
		const type = parser.expect(patterns.mediaRange).toLowerCase();
		const params = parser.accept(patterns.parameters);
		const qvalue = parser.accept(patterns.qvalue);
		const extensions = qvalue ? parser.accept(patterns.extensions) : '';
		const weight = qvalue ? +qvalue : 1;
		yield { type, params, weight, extensions };
		if (parser.ended()) return;
		parser.expect(patterns.comma);
	}
};

exports['accept-charset'] = simpleAccept('charset', patterns.token);
exports['accept-encoding'] = simpleAccept('encoding', patterns.token);
exports['accept-language'] = simpleAccept('language', patterns.languageRange);

exports['te'] = function* (header) {
	if (!header) return;
	if (typeof header !== 'string') throw new TypeError('Expected header to be a string');
	for (const parser = new Parser(header);;) {
		if (!parser.accept(patterns.trailers)) {
			let encoding = parser.accept(patterns.transferCoding);
			let params = '';
			if (encoding) {
				encoding = encoding.toLowerCase();
				if (encoding === 'chunked') throw new Error('Malformed header value');
			} else {
				encoding = parser.expect(patterns.token).toLowerCase();
				params = parser.accept(patterns.transferParameters);
			}
			const weight = +(parser.accept(patterns.qvalue) || 1);
			yield { encoding, params, weight };
		}
		if (parser.ended()) return;
		parser.expect(patterns.comma);
	}
};

exports.parameters = function* (params) {
	if (!params) return;
	if (typeof params !== 'string') throw new TypeError('Expected parameters to be a string');
	for (const parser = new Parser(params);;) {
		let [, key, value] = parser.expect(patterns.nextParameter);
		key = key.toLowerCase();
		if (value && value.charCodeAt(0) === 34) value = value.slice(1, -1).replace(quotedPair, '$1');
		yield { key, value };
		if (parser.ended()) return;
	}
};
