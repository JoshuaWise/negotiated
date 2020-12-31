'use strict';
const { expect } = require('chai');
const { mediaTypes: parse } = require('../.');

const type = (type, weight, params = '', extensions = '') => ({ type, params, weight, extensions });

describe('mediaTypes()', function () {
	it('should throw when given invalid input', function () {
		expect(() => [...parse(1)]).to.throw(TypeError);
		expect(() => [...parse({})]).to.throw(TypeError);
		expect(() => [...parse('foo')]).to.throw(Error);
		expect(() => [...parse('foo//bar')]).to.throw(Error);
		expect(() => [...parse('foo/ bar')]).to.throw(Error);
		expect(() => [...parse('"foo"/bar')]).to.throw(Error);
		expect(() => [...parse(', foo/bar')]).to.throw(Error);
		expect(() => [...parse('foo/bar, ')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=2')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q= 0')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=0.0000')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=1.001')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=0, ')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; q=0;')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; x')]).to.throw(Error);
		expect(() => [...parse('foo/bar ; x= 0')]).to.throw(Error);
	});
	it('should correctly parse media types', function () {
		expect([...parse('foo/bar')]).to.deep.equal([type('foo/bar', 1)]);
		expect([...parse('foO/BAR')]).to.deep.equal([type('foo/bar', 1)]);
		expect([...parse('foo/BAR  ,  FOO/bar')]).to.deep.equal([type('foo/bar', 1), type('foo/bar', 1)]);
	});
	it('should correctly capture media parameters', function () {
		expect([...parse('foo/bar; baz=qux')]).to.deep.equal([type('foo/bar', 1, '; baz=qux')]);
		expect([...parse('foo/BAR  ;  baz=qux  ,  a/b;c=d ;  e=" f\\\",; "')]).to.deep.equal([
			type('foo/bar', 1, '  ;  baz=qux'),
			type('a/b', 1, ';c=d ;  e=" f\\\",; "'),
		]);
	});
	it('should correctly parse the weight parameter', function () {
		expect([...parse('foo/bar; q=0.1')]).to.deep.equal([type('foo/bar', 0.1)]);
		expect([...parse('foo/bar;  q=0.,  baz/QUX  ;  q=1.')]).to.deep.equal([
			type('foo/bar', 0),
			type('baz/qux', 1),
		]);
		expect([...parse('foo/bar; x=y ; ok=" ;good, " ;  Q=0.221,  baz/QUX  ; a=bcd123 ;  q=1.000')]).to.deep.equal([
			type('foo/bar', 0.221, '; x=y ; ok=" ;good, "'),
			type('baz/qux', 1, '  ; a=bcd123'),
		]);
	});
	it('should correctly capture extension parameters', function () {
		expect([...parse('foo/bar; q=0.1; x;y=z')]).to.deep.equal([type('foo/bar', 0.1, '', '; x;y=z')]);
		expect([...parse('foo/bar;  q=0.  ;  x;  y=z,  baz/QUX  ;  q=1.;a;b=" hello, ";c')]).to.deep.equal([
			type('foo/bar', 0, '', '  ;  x;  y=z'),
			type('baz/qux', 1, '', ';a;b=" hello, ";c'),
		]);
		expect([...parse('foo/bar; x=y ; ok=" ;good, " ;  q=0.221  ;  x;  y=" hello, ",  baz/QUX  ; a=bcd123 ;  q=1.000; q=0')]).to.deep.equal([
			type('foo/bar', 0.221, '; x=y ; ok=" ;good, "', '  ;  x;  y=" hello, "'),
			type('baz/qux', 1, '  ; a=bcd123', '; q=0'),
		]);
	});
});
