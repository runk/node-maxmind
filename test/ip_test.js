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


  describe('v6ToBuffer', function() {

    it('should work', function() {
      var b = ip.v6ToBuffer('2001:0db8:85a3:0042:1000:8a2e:0370:7334');
      assert.equal(b.toString('base64'), 'IAENuIWjAEIQAIouA3BzNA==');
    });

  });

});
