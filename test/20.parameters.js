'use strict';
const { expect } = require('chai');
const { parameters, mediaTypes, transferEncodings } = require('../.');

const param = (key, value) => ({ key, value });
const parse = (iterator, ext = false) => [...parameters([...iterator][0][ext ? 'extensions' : 'params'])];

describe('parameters', function () {
	it('should throw when given improper input', function () {
		expect(() => [...parameters(1)]).to.throw(TypeError);
		expect(() => [...parameters({})]).to.throw(TypeError);
		expect(() => [...parameters('foo')]).to.throw(Error);
		expect(() => [...parameters('foo=bar')]).to.throw(Error);
		expect(() => [...parameters('; foo;')]).to.throw(Error);
		expect(() => [...parameters('; foo ')]).to.throw(Error);
		expect(() => [...parameters('; foo=bar;')]).to.throw(Error);
		expect(() => [...parameters('; foo=bar ')]).to.throw(Error);
		expect(() => [...parameters('; foo="bar" ')]).to.throw(Error);
	});
	it('should correctly parse media parameters', function () {
		expect(parse(mediaTypes('#/#; a=b'))).to.deep.equal([param('a', 'b')]);
		expect(parse(mediaTypes('#/#; FOO=BAR'))).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(mediaTypes('#/#; FOO=" ;ba\\r\\\\\\\" "'))).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(mediaTypes('#/#;   FOO=" ;\u03c0\u{1f600}ba\\r\\\\\\\" "  ;  *=bcde123'))).to.deep.equal([
			param('foo', ' ;\u03c0\u{1f600}bar\\" '),
			param('*', 'bcde123'),
		]);
	});
	it('should correctly parse transfer-encoding parameters', function () {
		expect(parse(transferEncodings('#; a  \t=  b'))).to.deep.equal([param('a', 'b')]);
		expect(parse(transferEncodings('#; FOO = BAR'))).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(transferEncodings('#; FOO  = \t" ;ba\\r\\\\\\\" "'))).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(transferEncodings('#; FOO=\t\t" ;ba\\r\\\\\\\" "  ;  *\t =bcde123'))).to.deep.equal([
			param('foo', ' ;bar\\" '),
			param('*', 'bcde123'),
		]);
	});
	it('should correctly parse extension parameters', function () {
		expect(parse(mediaTypes('#/#;q=1; a=b'), true)).to.deep.equal([param('a', 'b')]);
		expect(parse(mediaTypes('#/#;q=1; A'), true)).to.deep.equal([param('a')]);
		expect(parse(mediaTypes('#/#;q=1; FOO=BAR'), true)).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(mediaTypes('#/#;q=1; FOO=" ;ba\\r\\\\\\\" "'), true)).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(mediaTypes('#/#;q=1;   FOO=" ;ba\\r\\\\\\\" "  ; X  ; YZ ;  *=bcde123; ***'), true)).to.deep.equal([
			param('foo', ' ;bar\\" '),
			param('x'),
			param('yz'),
			param('*', 'bcde123'),
			param('***'),
		]);
	});
});
