
var assert = require('assert'),
    ls = require('../lib/lookup_service'),
    DatabaseInfo = require('../lib/database_info'),
    Country = require('../lib/Country'),
    Location = require('../lib/Location');


const GEO_CITY    = __dirname + '/dbs/GeoLiteCity.dat';
const GEO_CITY_FULL = __dirname + '/dbs/GeoIPCity_FULL.dat';
const GEO_COUNTRY = __dirname + '/dbs/GeoIP.dat';

describe('lib/lookup_service', function() {

    describe('#init', function() {

        it('inited prop should be false', function() {
            assert.equal(ls.inited, false);
        });

        it('should initialize', function() {
            assert.equal(ls.init(GEO_CITY), true);
        });

        it('should throw error for invalid path', function() {
            assert.throws(function() {
                ls.init(__dirname + '/dbs/blah')
            });
        });

        it('inited prop should be true', function() {
            assert.equal(ls.inited, true);
        });
    });

    describe('#ip2Long', function() {
        it("should conver IP to the long format", function() {
            var result = ls.ip2Long("87.229.134.24");
            assert.equal(result, 1474659864);

            var result = ls.ip2Long("195.68.137.18");
            assert.equal(result, 3276048658);

        });
    });

    describe('.databaseInfo', function() {

        it('inited prop should be true', function() {
            assert.equal(ls.inited, true);
        });

        it('should return proper DatabaseInfo', function() {
            var info = ls.databaseInfo;
            assert.ok(info instanceof DatabaseInfo);
            assert.equal(info.getType(), 428);
            assert.equal(info.isPremium(), true);
            assert.equal(info.getDate().getTime(), 1361232000000);
            assert.equal(info.toString(), "GEO-533LITE 20130219 Build 1 Copyright (c) 2012 MaxMind Inc All Rights Reserved");
        });
    });

    describe('#getCountry', function() {
        it('should init with country db', function() {
            assert.equal(ls.init(GEO_COUNTRY), true);
            assert.equal(ls.inited, true);
        });

        it('should return country by ip', function() {
            var c = ls.getCountry('109.60.171.33');
            assert.equal(c.getName(), 'Russian Federation');
            assert.equal(c.getCode(), 'RU');

            var c = ls.getCountry('210.250.100.200');
            assert.equal(c.getName(), 'Japan');
            assert.equal(c.getCode(), 'JP');

            var c = ls.getCountry('1.2.1.1');
            assert.equal(c.getName(), 'China');
            assert.equal(c.getCode(), 'CN');
        });

        it('should return unknown country by unknown ip', function() {
            var c = ls.getCountry('blahblah');
            assert.equal(c.getName(), 'N/A');
            assert.equal(c.getCode(), '--');
        });
    });

    describe("#seekCountry", function() {
        it("should perform binary search", function() {
            assert.equal(ls.init(GEO_CITY_FULL), true);
            var iplong = ls.ip2Long('195.68.137.18');
            assert.equal(ls.seekCountry(iplong), 9150727);

            iplong = ls.ip2Long('210.250.100.200');
            assert.equal(ls.seekCountry(iplong), 8067695);
        });
    });

    describe('#getLocation', function() {
        it('should init with country db', function() {
            assert.equal(ls.init(GEO_CITY_FULL), true);
            assert.equal(ls.inited, true);
        });

        it('should return location by ip', function() {
            var l = ls.getLocation('109.60.171.33');

            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '21');
            assert.equal(l.city, 'Ivanovo');
            assert.equal(l.latitude, 56.99719999999999);
            assert.equal(l.longitude, 40.97139999999999);
            assert.equal(l.metro_code, 0);
            assert.equal(l.dma_code, 0);
            assert.equal(l.area_code, 0);
        });

        it('should return location by ip (2)', function() {
            var l = ls.getLocation('195.68.137.18');
            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '47');
            assert.equal(l.city, 'Marfino');
            assert.equal(l.latitude, 55.70269999999999);
            assert.equal(l.longitude, 37.38319999999999);
            assert.equal(l.metro_code, 0);
            assert.equal(l.dma_code, 0);
            assert.equal(l.area_code, 0);
        });

        it('should return location by ip (3)', function() {
            var l = ls.getLocation('2.2.3.29');
            assert.equal(l.countryCode, 'FR');
            assert.equal(l.countryName, 'France');
            assert.equal(l.region, 'A2');
            assert.equal(l.city, 'Rennes');
            assert.equal(l.latitude, 48.111999999999995);
            assert.equal(l.longitude, -1.6742999999999881);
            assert.equal(l.metro_code, 0);
            assert.equal(l.dma_code, 0);
            assert.equal(l.area_code, 0);
        });
    });

});