var assert = require('assert');
var ip = require('../lib/IPParser');


describe('lib/ip', function() {

  describe('ipv4', function() {
    it('should successfully parse correct formats', function() {
      assert.deepEqual(ip.parseIPv4('127.0.0.1'), new Buffer([0x7f, 0x00, 0x00, 0x01]));
      assert.deepEqual(ip.parseIPv4('10.10.200.59'), new Buffer([0x0a, 0x0a, 0xc8, 0x3b]));
    });
  });

  describe('ipv6', function() {

    assert.deepEqual(ip.parseIPv4('127.0.0.1'), new Buffer([0x7f, 0x00, 0x00, 0x01]));
      assert.deepEqual(ip.parseIPv4('10.10.200.59'), new Buffer([0x0a, 0x0a, 0xc8, 0x3b]));

    it('should successfully parse correct formats', function() {
      assert.deepEqual(ip.parseIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334'),
        new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
      assert.deepEqual(ip.parseIPv6('2001:db8:85a3::8a2e:370:7334'),
        new Buffer([0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0x00, 0x00, 0x00, 0x00, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]));
    });
  });
});
