'use strict';
const { expect } = require('chai');
const { 'accept-encoding': parse } = require('../.');

const encoding = (encoding, weight) => ({ encoding, weight });

describe('accept-encoding', function () {
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
		expect(() => [...parse('foo ; x=0')]).to.throw(Error);
	});
	it('should correctly parse encodings', function () {
		expect([...parse('foo')]).to.deep.equal([encoding('foo', 1)]);
		expect([...parse('foO')]).to.deep.equal([encoding('foo', 1)]);
		expect([...parse('foo  ,  BAR')]).to.deep.equal([encoding('foo', 1), encoding('bar', 1)]);
	});
	it('should correctly parse the weight parameter', function () {
		expect([...parse('foo; q=0.1')]).to.deep.equal([encoding('foo', 0.1)]);
		expect([...parse('foo;  q=0.,  BAR  ;  q=1.')]).to.deep.equal([
			encoding('foo', 0),
			encoding('bar', 1),
		]);
		expect([...parse('foo;  Q=0.123,  BAR-baz  ;  q=1.000')]).to.deep.equal([
			encoding('foo', 0.123),
			encoding('bar-baz', 1),
		]);
	});
});
