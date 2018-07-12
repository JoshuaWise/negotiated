'use strict';
const { expect } = require('chai');
const { languages: parse } = require('../.');

const language = (language, weight) => ({ language, weight });

describe('languages()', function () {
	it('should throw when given invalid input', function () {
		expect(() => [...parse(1)]).to.throw(TypeError);
		expect(() => [...parse({})]).to.throw(TypeError);
		expect(() => [...parse('foo/bar')]).to.throw(Error);
		expect(() => [...parse('"foo"')]).to.throw(Error);
		expect(() => [...parse('foo-')]).to.throw(Error);
		expect(() => [...parse('foo-*-bar')]).to.throw(Error);
		expect(() => [...parse('foo123')]).to.throw(Error);
		expect(() => [...parse('foobarbaz')]).to.throw(Error);
		expect(() => [...parse('**')]).to.throw(Error);
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
	it('should correctly parse languages', function () {
		expect([...parse('foo')]).to.deep.equal([language('foo', 1)]);
		expect([...parse('foO')]).to.deep.equal([language('foo', 1)]);
		expect([...parse('foo  ,  BAR')]).to.deep.equal([language('foo', 1), language('bar', 1)]);
		expect([...parse('foo-bar-BAZ-a-10000  ,  BAR,*')]).to.deep.equal([
			language('foo-bar-baz-a-10000', 1),
			language('bar', 1),
			language('*', 1),
		]);
	});
	it('should correctly parse the weight parameter', function () {
		expect([...parse('foo; q=0.1')]).to.deep.equal([language('foo', 0.1)]);
		expect([...parse('foo;  q=0.,  BAR  ;  q=1.')]).to.deep.equal([
			language('foo', 0),
			language('bar', 1),
		]);
		expect([...parse('foo;  Q=0.123,  BAR-a-10000000  ;  q=1.000   ,   *  ;  q=0.512')]).to.deep.equal([
			language('foo', 0.123),
			language('bar-a-10000000', 1),
			language('*', 0.512),
		]);
	});
});
