'use strict';

var assert = require('assert');
var ip = require('../lib/ip');


describe('lib/ip', function() {

  describe('parse()', function() {
    describe('ipv4', function() {
      it('should successfully parse v4', function() {
        assert.deepEqual(ip.parse('127.0.0.1'), [0x7f, 0x00, 0x00, 0x01]);
        assert.deepEqual(ip.parse('10.10.200.59'), [0x0a, 0x0a, 0xc8, 0x3b]);
      });
    });

    describe('ipv6', function() {
      it('should successfully parse v6', function() {
        assert.deepEqual(ip.parse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
          new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
        assert.deepEqual(ip.parse('2001:db8:85a3::8a2e:370:7334'),
          new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
      });
    });
  });

  describe('bitAt()', function() {
    it('should return correct bit for given offset', function() {
      var address = new Buffer([0x0a, 0x0a, 0xc8, 0x3b]);
      assert.strictEqual(ip.bitAt(address, 1), 0);
      assert.strictEqual(ip.bitAt(address, 10), 0);
      assert.strictEqual(ip.bitAt(address, 23), 0);
      assert.strictEqual(ip.bitAt(address, 31), 1);
      assert.strictEqual(ip.bitAt(address, 999), 0);
    });
  });

  describe('validate()', function() {
    it('should work fine for IPv4', function() {
      assert.equal(ip.validate('64.4.4.4'), true);
      assert.equal(ip.validate('64.4.4.boom!'), false);
      assert.equal(ip.validate(undefined), false);
      assert.equal(ip.validate('kraken'), false);
    });

    it('should work fine for IPv6', function() {
      assert.equal(ip.validate('2001:4860:0:1001::3004:ef68'), true);
      assert.equal(ip.validate('::64.17.254.216'), true);
      assert.equal(ip.validate('2001:4860:0:1001::3004:boom!'), false);
    });
  });
});
