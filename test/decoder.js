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
      var test = new Decoder(new Buffer([0x00, 0x00]));
      assert.throws(function() {
        test.decode(0);
      }, /Invalid Extended Type at offset 1 val 7/);
    });
  });

  describe('sizeFromCtrlByte()', function() {
    var decoder = new Decoder(new Buffer([0x01, 0x02, 0x03, 0x04]));

    it('should return correct value (size <29)', function() {
      assert.deepEqual(decoder.sizeFromCtrlByte(60, 0), { value: 28, offset: 0 });
    });

    it('should return correct value (size = 29)', function() {
      assert.deepEqual(decoder.sizeFromCtrlByte(61, 0), { value: 30, offset: 1 });
    });

    it('should return correct value (size = 30)', function() {
      assert.deepEqual(decoder.sizeFromCtrlByte(62, 0), { value: 543, offset: 2 });
    });

    it('should return correct value (size = 31)', function() {
      assert.deepEqual(decoder.sizeFromCtrlByte(63, 0), { value: 131872, offset: 3 });
    });
  });

  describe('decodePointer()', function() {
    var decoder = new Decoder(new Buffer([0x01, 0x02, 0x03, 0x04]));

    it('should return correct value (pointer size = 0)', function() {
      assert.deepEqual(decoder.decodePointer(39, 0), { value: 1793, offset: 1 });
    });

    it('should return correct value (pointer size = 1)', function() {
      assert.deepEqual(decoder.decodePointer(45, 0), { value: 329986, offset: 2 });
    });

    it('should return correct value (pointer size = 2)', function() {
      assert.deepEqual(decoder.decodePointer(48, 0), { value: 592387, offset: 3 });
    });

    it('should return correct value (pointer size = 3)', function() {
      assert.deepEqual(decoder.decodePointer(56, 0), { value: 16909060, offset: 4 });
    });
  });
});
