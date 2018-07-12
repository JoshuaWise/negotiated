'use strict';
const { expect } = require('chai');
const { te: parse } = require('../.');

const encoding = (encoding, weight, params = '') => ({ encoding, params, weight });

describe('te', function () {
	it('should throw when given invalid input', function () {
		expect(() => [...parse(1)]).to.throw(TypeError);
		expect(() => [...parse({})]).to.throw(TypeError);
		expect(() => [...parse('foo/bar')]).to.throw(Error);
		expect(() => [...parse('"foo"')]).to.throw(Error);
		expect(() => [...parse(', foo')]).to.throw(Error);
		expect(() => [...parse('foo, ')]).to.throw(Error);
		expect(() => [...parse('foo ; q')]).to.throw(Error);
		expect(() => [...parse('foo ; q=')]).to.throw(Error);
		expect(() => [...parse('foo ; q=2')]).to.throw(Error);
		expect(() => [...parse('foo ; q= 0')]).to.throw(Error);
		expect(() => [...parse('foo ; q=0.0000')]).to.throw(Error);
		expect(() => [...parse('foo ; q=1.001')]).to.throw(Error);
		expect(() => [...parse('foo ; q=0, ')]).to.throw(Error);
		expect(() => [...parse('foo ; q=0;')]).to.throw(Error);
		expect(() => [...parse('foo ; q=0; x=0')]).to.throw(Error);
		expect(() => [...parse('foo ; x')]).to.throw(Error);
		expect(() => [...parse('chunked')]).to.throw(Error);
		expect(() => [...parse('trailers ; q=1')]).to.throw(Error);
		expect(() => [...parse('trailers ; x=1')]).to.throw(Error);
		expect(() => [...parse('gzip ; x=1')]).to.throw(Error);
	});
	it('should correctly parse transfer-encodings', function () {
		expect([...parse('foo')]).to.deep.equal([encoding('foo', 1)]);
		expect([...parse('foO')]).to.deep.equal([encoding('foo', 1)]);
		expect([...parse('foo  ,  trailers  ,  BAR')]).to.deep.equal([encoding('foo', 1), encoding('bar', 1)]);
		expect([...parse('trailers,gzip  ,  foobarbaz , compress')]).to.deep.equal([
			encoding('gzip', 1),
			encoding('foobarbaz', 1),
			encoding('compress', 1),
		]);
	});
	it('should correctly capture transfer-encoding parameters', function () {
		expect([...parse('foo; baz=qux')]).to.deep.equal([encoding('foo', 1, '; baz=qux')]);
		expect([...parse('foo; baz  =  qux')]).to.deep.equal([encoding('foo', 1, '; baz  =  qux')]);
		expect([...parse('FOO  ;  baz= qux  ,trailers,  deflate ,  a;b=c ;  d =" e\\\",; "')]).to.deep.equal([
			encoding('foo', 1, '  ;  baz= qux'),
			encoding('deflate', 1),
			encoding('a', 1, ';b=c ;  d =" e\\\",; "'),
		]);
	});
	it('should correctly parse the weight parameter', function () {
		expect([...parse('foo; q=0.1')]).to.deep.equal([encoding('foo', 0.1)]);
		expect([...parse('gzip  ;  q=0.552')]).to.deep.equal([encoding('gzip', 0.552)]);
		expect([...parse('foo; baz  =  qux ; q=1.000')]).to.deep.equal([encoding('foo', 1, '; baz  =  qux')]);
		expect([...parse('foo; baz  =  qux ; q=0.4')]).to.deep.equal([encoding('foo', 0.4, '; baz  =  qux')]);
		expect([...parse('foo;  q=0.,  BAR  ;  q=1.')]).to.deep.equal([
			encoding('foo', 0),
			encoding('bar', 1),
		]);
		expect([...parse('gzip;  Q=0.123,  BAR-baz  ;  q=1.000')]).to.deep.equal([
			encoding('gzip', 0.123),
			encoding('bar-baz', 1),
		]);
		expect([...parse('foo; x=y ; ok=" ;good, " ;  Q=0.221,trailers ,  QUX  ; a=bcd123 ;  q=1.000')]).to.deep.equal([
			encoding('foo', 0.221, '; x=y ; ok=" ;good, "'),
			encoding('qux', 1, '  ; a=bcd123'),
		]);
		expect([...parse('FOO  ;  baz= qux;q=0.000  ,trailers,  deflate ; q=0.008,  a;b=c ;  d =" e\\\",; "  ;  q=0.12')]).to.deep.equal([
			encoding('foo', 0, '  ;  baz= qux'),
			encoding('deflate', 0.008),
			encoding('a', 0.12, ';b=c ;  d =" e\\\",; "'),
		]);
	});
});
