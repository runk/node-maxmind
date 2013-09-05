var assert = require('assert'),
  ls = require('../lib/lookup_service'),
  timeZone = require('../lib/time_zone');

const GEO_CITY = __dirname + '/dbs/GeoIPCity.dat';


describe('lib/time_zone', function() {

  it('should init with city db', function() {
    assert.equal(ls.init(GEO_CITY), true);
  });

  it('should return proper timezone by ip', function() {
    var l = ls.getLocation('109.60.171.33');
    assert.equal(timeZone(l.countryCode, l.region), 'Europe/Moscow');
  });

});
