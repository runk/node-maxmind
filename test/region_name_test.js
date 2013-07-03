
var assert = require('assert'),
    ls = require('../lib/lookup_service'),
    regionName = require('../lib/region_name');

const GEO_CITY = __dirname + '/dbs/GeoIPCity.dat';

describe('lib/region_name', function() {

    it('should init with city db', function() {
        assert.equal(ls.init(GEO_CITY), true);
    });

    it('should return region name by ip', function() {
        var l = ls.getLocation('109.60.171.33');
        assert.equal(regionName(l.countryCode, l.region), 'Moscow City');
    });

});
