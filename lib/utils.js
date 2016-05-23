'use strict';

exports.concat2 = function(a, b) {
  return (a << 8) | b;
};

exports.concat3 = function(a, b, c) {
  return (a << 16) | (b << 8) | c;
};

exports.concat4 = function(a, b, c, d) {
  return (a << 24) | (b << 16) | (c << 8) | d;
};

