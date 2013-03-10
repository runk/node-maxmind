
var assert = require('assert'),
    ls = require('../lib/lookup_service'),
    DatabaseInfo = require('../lib/database_info'),
    Country = require('../lib/Country'),
    Location = require('../lib/Location');


const GEO_CITY    = __dirname + '/dbs/GeoLiteCity.dat';
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
        });

        it('should return unknown country by unknown ip', function() {
            var c = ls.getCountry('blahblah');
            assert.equal(c.getName(), 'N/A');
            assert.equal(c.getCode(), '--');
        });
    });

    describe('#getLocation', function() {
        it('should init with country db', function() {
            assert.equal(ls.init(GEO_CITY), true);
            assert.equal(ls.inited, true);
        });

        it('should return location by ip', function() {
            var l = ls.getLocation('109.60.171.33');

            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '48');
            assert.equal(l.city, 'Moscow');
            assert.equal(l.latitude, 55.75219999999999);
            assert.equal(l.longitude, 37.6156);
            assert.equal(l.metro_code, 0);
            assert.equal(l.dma_code, 0);
            assert.equal(l.area_code, 0);
        });
    });

});