
var assert = require('assert'),
    ls = require('../lib/lookup_service');

const GEO_CITY    = __dirname + '/dbs/GeoLiteCity.dat';
const GEO_COUNTRY = __dirname + '/dbs/GeoIP.dat';

describe('lib/lookup_service', function() {

    describe('* modes * ', function() {

        it('should return correct country with default opts', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_COUNTRY), true);

            var c = ls.getCountry('109.60.171.33');
            assert.equal(c.getName(), 'Russian Federation');
            assert.equal(c.getCode(), 'RU');
        });

        it('should return correct country with "indexCache" opt', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_COUNTRY, { indexCache: true }), true);

            var c = ls.getCountry('109.60.171.33');
            assert.equal(c.getName(), 'Russian Federation');
            assert.equal(c.getCode(), 'RU');
        });

        it('should return correct country with "memoryCache" opt', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_COUNTRY, { memoryCache: true }), true);

            var c = ls.getCountry('109.60.171.33');
            assert.equal(c.getName(), 'Russian Federation');
            assert.equal(c.getCode(), 'RU');
        });


        it('should return correct country with default opts', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_CITY), true);

            var l = ls.getLocation('109.60.171.33');
            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '48');
            assert.equal(l.city, 'Moscow');
        });

        it('should return correct country with "indexCache" opt', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_CITY, { indexCache: true }), true);

            var l = ls.getLocation('109.60.171.33');
            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '48');
            assert.equal(l.city, 'Moscow');
        });

        it('should return correct country with "memoryCache" opt', function() {
            assert.equal(ls.uninit(), true);
            assert.equal(ls.init(GEO_CITY, { memoryCache: true }), true);

            var l = ls.getLocation('109.60.171.33');
            assert.equal(l.countryCode, 'RU');
            assert.equal(l.countryName, 'Russian Federation');
            assert.equal(l.region, '48');
            assert.equal(l.city, 'Moscow');
        });

    });

});
