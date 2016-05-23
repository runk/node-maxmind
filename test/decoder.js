'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var Decoder = require('../lib/decoder');


describe('lib/decoder', function() {

  var decoder = new Decoder(
    fs.readFileSync(path.join(__dirname, 'data/test-data/GeoIP2-City-Test.mmdb')),
    1
  );

  describe('decodeByType()', function() {
    it('should fail for unknown type', function() {
      assert.throws(function() {
        decoder.decodeByType('kraken');
      }, /Unknown type/);
    });
  });

  describe('decodeUint()', function() {
    it('should return zero for unsupported int size', function() {
      assert.equal(decoder.decodeUint(1, 32), 0);
    });
  });

  describe('decode()', function() {
    it('should throw when extended type has wrong size', function() {
      var test = new Decoder(new Buffer([0x00, 0x00]), 1);
      assert.throws(function() {
        test.decode(0);
      }, /Invalid Extended Type at offset 1 val 7/);
    });
  });

});
