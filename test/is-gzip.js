'use strict';

var assert = require('assert');
var isGzip = require('../lib/is-gzip');

describe('lib/is-gzip', function() {
  it('should return false for short buffers', function() {
    assert.equal(isGzip(new Buffer([1, 2])), false);
  });

  it('should return false for string buffer', function() {
    assert.equal(isGzip(new Buffer('kraken')), false);
  });

  it('should return false for string buffer', function() {
    // gzipped "kraken" string
    // shell: `echo "kraken" | gzip | base64`
    var buffer = new Buffer('H4sIAGBDv1gAA8suSsxOzeMCAKjj9U8HAAAA', 'base64');
    assert.equal(isGzip(buffer), true);
  });
});
