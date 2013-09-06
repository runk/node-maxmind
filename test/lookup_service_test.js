var assert = require('assert'),
  ls = require('../lib/lookup_service'),
  Database = require('../lib/database');

const GEO_CITY      = __dirname + '/dbs/GeoIPCity.dat';
const GEO_COUNTRY   = __dirname + '/dbs/GeoIP.dat';
const GEO_ASN       = __dirname + '/dbs/GeoIPASNum.dat';


describe('lib/lookup_service', function() {


  describe('init()', function() {

    it('should initialize with single db', function() {
      ls.uninit();
      assert.equal(ls.init(GEO_CITY), true);
    });

    it('should initialize with multiply dbs', function() {
      ls.uninit();
      assert.equal(ls.init([GEO_CITY, GEO_ASN]), true);
    });
  });


  describe('ip2Long()', function() {
    it("should conver IP to the long format", function() {
      var result = ls.ip2Long("87.229.134.24");
      assert.equal(result, 1474659864);

      var result = ls.ip2Long("195.68.137.18");
      assert.equal(result, 3276048658);
    });
  });


  describe('getCountry()', function() {
    it('should init with country db', function() {
      assert.equal(ls.init(GEO_COUNTRY), true);
    });

    it('should return country by ip', function() {
      var c = ls.getCountry('109.60.171.33');
      assert.equal(c.name, 'Russian Federation');
      assert.equal(c.code, 'RU');

      var c = ls.getCountry('210.250.100.200');
      assert.equal(c.name, 'Japan');
      assert.equal(c.code, 'JP');

      var c = ls.getCountry('1.2.1.1');
      assert.equal(c.name, 'China');
      assert.equal(c.code, 'CN');
    });

    it('should return unknown country by unknown ip', function() {
      var c = ls.getCountry('blahblah');
      assert.equal(c.name, 'N/A');
      assert.equal(c.code, '--');
    });
  });


  describe("seekCountry()", function() {
    it("should perform binary search", function() {
      var db = new Database(GEO_CITY);
      var iplong = ls.ip2Long('195.68.137.18');
      assert.equal(ls.seekCountry(db, iplong), 2854053);

      iplong = ls.ip2Long('210.250.100.200');
      assert.equal(ls.seekCountry(db, iplong), 2779115);
    });
  });


  describe('getLocation()', function() {
    it('should init with country db', function() {
        assert.equal(ls.init(GEO_CITY), true);
    });

    it('should return location by ip', function() {
      var l = ls.getLocation('109.60.171.33');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, '48');
      assert.equal(l.regionName, 'Moscow City');
      assert.equal(l.city, 'Moscow');
      assert.equal(l.latitude, 55.75219999999999);
      assert.equal(l.longitude, 37.6156);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return proper info for non-latin names', function() {
      var l = ls.getLocation('194.181.164.72');

      assert.equal(l.countryCode, 'PL');
      assert.equal(l.countryName, 'Poland');
      assert.equal(l.region, '77');
      assert.equal(l.regionName, 'Malopolskie');
      assert.equal(l.city, 'Kraków');
      assert.equal(l.latitude, 50.08330000000001);
      assert.equal(l.longitude, 19.91669999999999);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return location by ip (2)', function() {
      var l = ls.getLocation('195.68.137.18');
      assert.equal(l.countryCode, 'RU');
      assert.equal(l.countryName, 'Russian Federation');
      assert.equal(l.region, null);
      assert.equal(l.regionName, null);
      assert.equal(l.city, null);
      assert.equal(l.latitude, 60);
      assert.equal(l.longitude, 100);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });

    it('should return location by ip (3)', function() {
      var l = ls.getLocation('2.2.3.29');
      assert.equal(l.countryCode, 'FR');
      assert.equal(l.countryName, 'France');
      assert.equal(l.region, 'A2');
      assert.equal(l.regionName, 'Bretagne');
      assert.equal(l.city, 'Rennes');
      assert.equal(l.latitude, 48.111999999999995);
      assert.equal(l.longitude, -1.6742999999999881);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });
  });


  describe('getOrg()', function() {
    it('should init with country db', function() {
      assert.equal(ls.init(GEO_ASN), true);
    });

    it('should return ISP by ip', function() {
      assert.equal(ls.getOrganization('109.60.171.33'), 'AS47241 CJSC "Ivtelecom"')
      assert.equal(ls.getOrganization('64.4.4.4'), 'AS8075 Microsoft Corp')
      assert.equal(ls.getOrganization('210.250.100.200'), 'AS2527 So-net Entertainment Corporation')
    });
  });

});
