var assert = require('assert'),
  ip = require('../lib/ip');


describe('lib/ip', function() {

  describe('v4ToLong()', function() {
    it('should conver IP to the long format', function() {
      var result = ip.v4ToLong('87.229.134.24');
      assert.equal(result, 1474659864);
    });

    it('should conver IP to the long format (2)', function() {
      var result = ip.v4ToLong('195.68.137.18');
      assert.equal(result, 3276048658);
    });
  });


  describe('v6ToArray', function() {

    it('should parse complete address', function() {
      assert.deepEqual(
        ip.v6ToArray('2001:0db8:85a3:0042:1000:8a2e:0370:7334'),
        [0x20, 0x1, 0xd, 0xb8, 0x85, 0xa3, 0, 0x42, 0x10, 0, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34]
      );
    })

    it('should parse two-part address', function() {
      assert.deepEqual(
        ip.v6ToArray('2001:4860:0:1001::3004:ef68'),
        [0x20, 0x01, 0x48, 0x60, 0, 0, 0x10, 0x01, 0, 0, 0, 0, 0x30, 0x04, 0xef, 0x68]
      );
    });

    it('should parse `::` in the end of address', function() {
      assert.deepEqual(
        ip.v6ToArray('2001:200::'),
        [0x20, 0x01, 0x02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      );
    });

    it('should parse ipv4 with `::ffff`', function() {
      assert.deepEqual(
        ip.v6ToArray('::ffff:64.17.254.216'),
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 17, 254, 216]
      );
    });

    it('should parse ipv4 with `::`', function() {
      assert.deepEqual(
        ip.v6ToArray('::64.17.254.216'),
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 17, 254, 216]
      );
    });

  });


  describe('v4toBinary()', function() {

    it('should return proper result', function() {
      assert.deepEqual(ip.v4toBinary('64.17.254.216'), [
        0, 1, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 1, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 0,
        1, 1, 0, 1, 1, 0, 0, 0
      ].join(''));
    });

  });

});
