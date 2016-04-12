var assert = require('assert');
var path = require('path');
var mmdbreader = require('../index');
var ipaddr = require('ip-address');



var actual = function(file, subnetKey) {
  var data = require('./data/source-data/' + file);
  var hash = {};
  data.forEach(function(item) {
    for (var key in item)
      hash[key] = item[key];
  });

  return {
    hash: hash,
    get: function(subnet) {
      var item = hash[subnet];
      assert(item);
      return item;
    }
  };
}

describe('maxmind', function() {

  describe('basic functionality', function() {

    it('should successfully handle database', function() {
      assert(mmdbreader.openSync(__dirname + '/data/test-data/GeoIP2-City-Test.mmdb'));
    });

    it('should fetch geo ip', function() {
      var geoIp = mmdbreader.openSync(__dirname + '/data/test-data/GeoIP2-City-Test.mmdb');
      var data = actual('GeoIP2-City-Test.json');
      assert.deepEqual(geoIp.getGeoDataSync('1.1.1.1'), null);

      assert.deepEqual(geoIp.getGeoDataSync('175.16.198.255'), null);
      assert.deepEqual(geoIp.getGeoDataSync('175.16.199.1'), data.get('::175.16.199.0/120'));
      assert.deepEqual(geoIp.getGeoDataSync('175.16.199.255'), data.get('::175.16.199.0/120'))
      assert.deepEqual(geoIp.getGeoDataSync('::175.16.199.255'), data.get('::175.16.199.0/120'))
      assert.deepEqual(geoIp.getGeoDataSync('175.16.200.1'), null);

      assert.deepEqual(geoIp.getGeoDataSync('2a02:cf40:ffff::'), data.get('2a02:cf40::/29'));
      assert.deepEqual(geoIp.getGeoDataSync('2a02:cf47:0000::'), data.get('2a02:cf40::/29'));
      assert.deepEqual(geoIp.getGeoDataSync('2a02:cf48:0000::'), null);
    });

    it('should handle corrupt database', function() {
      assert.throws(function verify() {
        mmdbreader.openSync('./data/README.md');
      });
    });
  });

  describe('data files', function() {

    var files = [
      'GeoIP2-Anonymous-IP-Test',
      'GeoIP2-City-Test',
      'GeoIP2-Connection-Type-Test',
      'GeoIP2-Country-Test',
      'GeoIP2-Domain-Test',
      'GeoIP2-Enterprise-Test',
      'GeoIP2-ISP-Test',
      'GeoIP2-Precision-City-Test',
      'GeoIP2-Precision-ISP-Test',
    ];

    var tester = function(geoIp, data) {
      for (var subnet in data.hash) {
        var ip = new ipaddr.Address6(subnet);
        // TODO: check random address from the subnet?
        // see http://ip-address.js.org/#address4/biginteger
        // see https://github.com/andyperlitch/jsbn
        assert.deepEqual(geoIp.getGeoDataSync(ip.startAddress().address), data.hash[subnet], subnet);
        assert.deepEqual(geoIp.getGeoDataSync(ip.endAddress().address), data.hash[subnet], subnet);
      }
    };

    files.forEach(function(file) {
      it('should test everything: ' + file, function() {
        var geoIp = mmdbreader.openSync(__dirname + '/data/test-data/' + file + '.mmdb');
        var data = actual(file + '.json');
        tester(geoIp, data);
      });
    });
  });

});
