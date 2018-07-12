# negotiated [![Build Status](https://travis-ci.org/JoshuaWise/negotiated.svg?branch=master)](https://travis-ci.org/JoshuaWise/negotiated)

This is a low-level utility for correctly parsing the HTTP content negotiation headers. It doesn't interpret the parsed values in any way, except for ensuring that they are syntactically correct.

## Installation

```bash
npm install --save negotiated
```

## Usage

```js
const negotiated = require('negotiated');

const best = Array.from(negotiated.languages('fr;q=0.4, ja-JP;q=0.2, de-DE;q=0.7, en;q=0.5'))
  .reduce((a, b) => a.weight >= b.weight ? a : b);

console.log(best.language); // => "de-de"
```

This package exports six functions:

- `types()`: parses the Accept header, emitting `{ type, params, weight, extensions }`
- `charsets()`: parses the Accept-Charset header, emitting `{ charset, weight }`
- `encodings()`: parses the Accept-Encoding header, emitting `{ encoding, weight }`
- `languages()`: parses the Accept-Language header, emitting `{ language, weight }`
- `transferEncodings()`: parses the TE header, emitting `{ encoding, params, weight }`
- `parameters()`: parses `params` and `extensions` found above, emitting `{ key, value }`

Each of the exported functions takes a string as the only argument. An iterator is returned, which parses one comma-separated item at a time. If the input string is invalid (according to [RFC 7230](https://tools.ietf.org/html/rfc7230) or [RFC 7231](https://tools.ietf.org/html/rfc7231)), an error will be thrown mid-iteration.

## Examples

#### Iterating over the Accept-Encoding header

```js
const negotiated = require('negotiated');

for (const { encoding, weight } of negotiated.encodings('gzip;q=0.5, my-custom-encoding;q=1')) {
  if (weight > 0.8) console.log(`${encoding} is desired`);
}

// => "my-custom-encoding is desired"
```

#### Parsing media parameters

```js
const negotiated = require('negotiated');

const firstItem = Array.from(negotiated.types('application/json; CHARSET="utf-8"'))[0];

console.log(Array.from(negotiated.parameters(firstItem.params))); // => [{ key: 'charset', value: 'utf-8' }]
```
