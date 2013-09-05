var assert = require('assert'),
  Location = require('../lib/location');


describe('lib/location', function() {

  describe('distance()', function() {
    it('should return proper distance', function() {
      var l1 = new Location();
      l1.latitude  = 55.75219999999999;
      l1.longitude = 37.6156;

      var l2 = new Location();
      l2.latitude  = 59.666702;
      l2.longitude = 10.800003;

      assert.equal(l1.distance(l1), 0);

      assert.equal(l1.distance(l2), 1640.543444);
      assert.equal(l2.distance(l1), 1640.543444);
    });
  });

});
