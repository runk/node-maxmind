
var assert = require('assert'),
  ls = require('../lib/lookup_service');

const GEO_CITY    = __dirname + '/dbs/GeoIPCity.dat';
const GEO_COUNTRY = __dirname + '/dbs/GeoIP.dat';
const GEO_ASN     = __dirname + '/dbs/GeoIPASNum.dat';

describe('lib/lookup_service', function() {


  describe('* multi mode * ', function() {
    it('should return correct country with default opts', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init([GEO_COUNTRY, GEO_ASN]), true);

      var c = ls.getCountry('109.60.171.33');
      assert.equal(c.name, 'Russian Federation');
      assert.equal(c.code, 'RU');
      assert.equal(c.continentCode, 'EU');

      var org = ls.getOrganization('109.60.171.33');
      assert.equal(org, 'AS47241 CJSC "Ivtelecom"');
    });

    it('should throw exception for unavailable dbs', function() {
      assert.throws(function() {
        ls.getRegion('109.60.171.33');
      });
    });
  });


  describe('* modes * ', function() {

    it('should return correct country with default opts', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_COUNTRY), true);

      var c = ls.getCountry('109.60.171.33');
      assert.equal(c.name, 'Russian Federation');
      assert.equal(c.code, 'RU');
      assert.equal(c.continentCode, 'EU');
    });

    it('should return correct country with "indexCache" opt', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_COUNTRY, { indexCache: true }), true);

      var c = ls.getCountry('109.60.171.33');
      assert.equal(c.name, 'Russian Federation');
      assert.equal(c.code, 'RU');
      assert.equal(c.continentCode, 'EU');
    });

    it('should return correct country with "memoryCache" opt', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_COUNTRY, { memoryCache: true }), true);

      var c = ls.getCountry('109.60.171.33');
      assert.equal(c.name, 'Russian Federation');
      assert.equal(c.code, 'RU');
      assert.equal(c.continentCode, 'EU');
    });

    it('should work fine with both `memoryCache` and `indexCache`', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_COUNTRY, { memoryCache: true, indexCache: true }), true);
      assert.equal(ls.getCountry('109.60.171.33').code, 'RU');
    });

    it('should return correct country with default opts', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_CITY), true);

      var l = ls.getLocation('109.60.171.33');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, '48');
      assert.equal(l.city, 'Moscow');
      assert.equal(l.continentCode, 'EU');
    });

    it('should return correct country with "indexCache" opt', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_CITY, { indexCache: true }), true);

      var l = ls.getLocation('109.60.171.33');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, '48');
      assert.equal(l.city, 'Moscow');
      assert.equal(l.continentCode, 'EU');
    });

    it('should return correct country with "memoryCache" opt', function() {
      assert.equal(ls.uninit(), true);
      assert.equal(ls.init(GEO_CITY, { memoryCache: true }), true);

      var l = ls.getLocation('109.60.171.33');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, '48');
      assert.equal(l.city, 'Moscow');
      assert.equal(l.continentCode, 'EU');
    });

  });

});
