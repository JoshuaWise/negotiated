'use strict';
const { expect } = require('chai');
const { parameters, accept, te } = require('../.');

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
		expect(parse(accept('#/#; a=b'))).to.deep.equal([param('a', 'b')]);
		expect(parse(accept('#/#; FOO=BAR'))).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(accept('#/#; FOO=" ;ba\\r\\\\\\\" "'))).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(accept('#/#;   FOO=" ;ba\\r\\\\\\\" "  ;  *=bcde123'))).to.deep.equal([
			param('foo', ' ;bar\\" '),
			param('*', 'bcde123'),
		]);
	});
	it('should correctly parse transfer-encoding parameters', function () {
		expect(parse(te('#; a  \t=  b'))).to.deep.equal([param('a', 'b')]);
		expect(parse(te('#; FOO = BAR'))).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(te('#; FOO  = \t" ;ba\\r\\\\\\\" "'))).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(te('#; FOO=\t\t" ;ba\\r\\\\\\\" "  ;  *\t =bcde123'))).to.deep.equal([
			param('foo', ' ;bar\\" '),
			param('*', 'bcde123'),
		]);
	});
	it('should correctly parse extension parameters', function () {
		expect(parse(accept('#/#;q=1; a=b'), true)).to.deep.equal([param('a', 'b')]);
		expect(parse(accept('#/#;q=1; A'), true)).to.deep.equal([param('a')]);
		expect(parse(accept('#/#;q=1; FOO=BAR'), true)).to.deep.equal([param('foo', 'BAR')]);
		expect(parse(accept('#/#;q=1; FOO=" ;ba\\r\\\\\\\" "'), true)).to.deep.equal([param('foo', ' ;bar\\" ')]);
		expect(parse(accept('#/#;q=1;   FOO=" ;ba\\r\\\\\\\" "  ; X  ; YZ ;  *=bcde123; ***'), true)).to.deep.equal([
			param('foo', ' ;bar\\" '),
			param('x'),
			param('yz'),
			param('*', 'bcde123'),
			param('***'),
		]);
	});
});
