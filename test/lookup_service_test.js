var assert = require('assert'),
  ls = require('../lib/lookup_service'),
  Database = require('../lib/database');

const GEO_CITY      = __dirname + '/dbs/GeoIPCity.dat';
const GEO_CITY_V6   = __dirname + '/dbs/GeoIPCityv6.dat';
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

  describe('getCountry()', function() {
    before(function() {
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


  describe('seekCountry()', function() {
    it('should perform binary search', function() {
      var db = new Database(GEO_CITY);
      assert.equal(ls.seekCountry(db, 3276048658), 2854053);
      assert.equal(ls.seekCountry(db, 3539625160), 2779115);
    });
  });

  // LookupService cl = new LookupService(
  //       "src/test/resources/GeoIP/GeoLiteCityv6.dat",
  //       LookupService.GEOIP_MEMORY_CACHE);
  //   Location l1 = cl.getLocationV6("2a02:ff40::");
  //   Location l2 = cl.getLocationV6("2001:208::");

  //   assertEquals("SG", l2.countryCode);
  //   assertEquals("Singapore", l2.countryName);
  //   assertEquals(1.3666992, l2.latitude, DELTA);
  //   assertEquals(103.79999, l2.longitude, DELTA);
  //   assertEquals(11074.876894, l2.distance(l1), DELTA);
  //   assertEquals(11074.876894, l1.distance(l2), DELTA);
  //   assertEquals(0, l2.metro_code);
  //   assertEquals("Asia/Singapore",
  //       timeZone.timeZoneByCountryAndRegion(l2.countryCode, l2.region));

  //   cl.close();
  describe.skip('seekCountryV6()', function() {
    it('should return correct index', function() {
      var db = new Database(GEO_CITY_V6);
      var iplong = ls.ip2Long('195.68.137.18');
      assert.equal(ls.seekCountry(db, iplong), 2854053);

      iplong = ls.ip2Long('210.250.100.200');
      assert.equal(ls.seekCountry(db, iplong), 2779115);
    });
  });


  describe('getLocation()', function() {
    before(function() {
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

    it('should return location by ip (4)', function() {
      var l = ls.getLocation('180.189.170.18');
      assert.equal(l.countryCode, 'TL');
      assert.equal(l.countryName, 'Timor-Leste');
      assert.equal(l.region, null);
      assert.equal(l.regionName, null);
      assert.equal(l.city, null);
      assert.equal(l.latitude, -8.569999999999993);
      assert.equal(l.longitude, 125.57);
      assert.equal(l.metroCode, 0);
      assert.equal(l.dmaCode, 0);
      assert.equal(l.areaCode, 0);
    });
  });


  describe('getOrg()', function() {
    before(function() {
      assert.equal(ls.init(GEO_ASN), true);
    });

    it('should return ISP by ip', function() {
      assert.equal(ls.getOrganization('109.60.171.33'), 'AS47241 CJSC "Ivtelecom"');
      assert.equal(ls.getOrganization('64.4.4.4'), 'AS8075 Microsoft Corp');
      assert.equal(ls.getOrganization('210.250.100.200'), 'AS2527 So-net Entertainment Corporation');
    });

    it('should work fine with utf8', function() {
      assert.equal(ls.getOrganization('189.63.71.77'), 'AS28573 Serviços de Comunicação S.A.');
    });
  });

});
