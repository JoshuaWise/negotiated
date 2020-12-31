'use strict';
const pattern = (capture, regex) => ({ regex, capture });

// https://tools.ietf.org/html/rfc7230#appendix-B
// https://tools.ietf.org/html/rfc7231#appendix-D

exports.token = pattern(0, /[-!#$%&'*+.^_`|~a-z\d]+/yi);
exports.mediaRange = pattern(0, /[-!#$%&'*+.^_`|~a-z\d]+\/[-!#$%&'*+.^_`|~a-z\d]+/yi);
exports.languageRange = pattern(0, /[a-z]{1,8}(?:-[a-z\d]{1,8})*|\*/yi);
exports.trailers = pattern(0, /trailers/yi);
exports.transferCoding = pattern(0, /gzip|deflate|compress|chunked/yi);
exports.parameters = pattern(0, /(?:[ \t]*;[ \t]*(?!q=)[-!#$%&'*+.^_`|~a-z\d]+=(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))*/yi);
exports.transferParameters = pattern(0, /(?:[ \t]*;[ \t]*(?!q=)[-!#$%&'*+.^_`|~a-z\d]+[ \t]*=[ \t]*(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))*/yi);
exports.extensions = pattern(0, /(?:[ \t]*;[ \t]*[-!#$%&'*+.^_`|~a-z\d]+(?:=(?:[-!#$%&'*+.^_`|~a-z\d]+|"(?:[ \t\x21\x23-\x5b\x5d-\x7e\x80-\xff]|\\[ \t\x21-\x7e\x80-\xff])*"))?)*/yi);
exports.qvalue = pattern(1, /[ \t]*;[ \t]*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?)/yi);
exports.comma = pattern(0, /[ \t]*,[ \t]*/yi);
exports.nextParameter = pattern(-1, /[; \t]+([^=; \t]+)(?:[= \t]+([^"; \t]+|"(?:[^"\\]|\\.)*"))?/yi);
