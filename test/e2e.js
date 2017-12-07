'use strict';

var path = require('path');
var assert = require('assert');
var maxmind = require('../index');
var ipaddr = require('ip-address');


var actual = function(file) {
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
};

describe('maxmind', function() {

  var dataDir = path.join(__dirname, 'data/test-data');

  describe('basic functionality', function() {

    it('should successfully handle database', function() {
      assert(maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb')));
    });

    it('should fetch geo ip', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'));
      var data = actual('GeoIP2-City-Test.json');
      assert.deepEqual(geoIp.get('1.1.1.1'), null);

      assert.deepEqual(geoIp.get('175.16.198.255'), null);
      assert.deepEqual(geoIp.get('175.16.199.1'), data.get('::175.16.199.0/120'));
      assert.deepEqual(geoIp.get('175.16.199.255'), data.get('::175.16.199.0/120'));
      assert.deepEqual(geoIp.get('::175.16.199.255'), data.get('::175.16.199.0/120'));
      assert.deepEqual(geoIp.get('175.16.200.1'), null);

      assert.deepEqual(geoIp.get('2a02:cf40:ffff::'), data.get('2a02:cf40::/29'));
      assert.deepEqual(geoIp.get('2a02:cf47:0000::'), data.get('2a02:cf40::/29'));
      assert.deepEqual(geoIp.get('2a02:cf48:0000::'), null);
    });

    it('should handle corrupt database', function() {
      assert.throws(function verify() {
        maxmind.openSync('./data/README.md');
      });
    });

    it('should accept cache options', function() {
      assert(maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), {
        cache: { max: 1000 }
      }));
    });
  });

  describe('section: data', function() {
    it('should decode all possible types - complex', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'MaxMind-DB-test-decoder.mmdb'));
      assert.deepEqual(geoIp.get('::1.1.1.1'), {
        array: [1, 2, 3],
        boolean: true,
        bytes: new Buffer([0, 0, 0, 42]),
        double: 42.123456,
        // It should be 1.1, but there's some issue with rounding in v8
        float: 1.100000023841858,
        int32: -268435456,
        map: { mapX: { arrayX: [7, 8, 9], utf8_stringX: 'hello' } },
        uint128: '1329227995784915872903807060280344576',
        uint16: 100,
        uint32: 268435456,
        uint64: '1152921504606846976',
        utf8_string: 'unicode! ☯ - ♫'
      });
    });

    it('should decode all possible types - zero/empty values', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'MaxMind-DB-test-decoder.mmdb'));
      assert.deepEqual(geoIp.get('::0.0.0.0'), {
        array: [],
        boolean: false,
        bytes: new Buffer([]),
        double: 0,
        float: 0,
        int32: 0,
        map: {},
        uint128: '0',
        uint16: 0,
        uint32: 0,
        uint64: '0',
        utf8_string: ''
      });
    });

    it('should return correct value: string entries', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'MaxMind-DB-string-value-entries.mmdb'));
      assert.equal(geoIp.get('1.1.1.1'), '1.1.1.1/32');
      assert.equal(geoIp.get('1.1.1.2'), '1.1.1.2/31');
      assert.equal(geoIp.get('175.2.1.1'), null);
    });
  });

  describe('section: binary search tree', function() {

    var files = [
      'GeoIP2-Anonymous-IP-Test',
      'GeoIP2-City-Test',
      'GeoIP2-Connection-Type-Test',
      'GeoIP2-Country-Test',
      'GeoIP2-Domain-Test',
      'GeoIP2-Enterprise-Test',
      'GeoIP2-ISP-Test',
      'GeoIP2-Precision-City-Test',
      'GeoIP2-Precision-ISP-Test'
    ];

    var tester = function(geoIp, data) {
      for (var subnet in data.hash) {
        var ip = new ipaddr.Address6(subnet);
        // TODO: check random address from the subnet?
        // see http://ip-address.js.org/#address4/biginteger
        // see https://github.com/andyperlitch/jsbn
        assert.deepEqual(geoIp.get(ip.startAddress().address), data.hash[subnet], subnet);
        assert.deepEqual(geoIp.get(ip.endAddress().address), data.hash[subnet], subnet);
      }
    };

    files.forEach(function(file) {
      it('should test everything: ' + file, function() {
        var geoIp = maxmind.openSync(path.join(dataDir, '/' + file + '.mmdb'));
        var data = actual(file + '.json');
        tester(geoIp, data);
      });
    });
  });

  describe('locales support', function() {
    it('should trim unwanted locales: whitelist en', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), {
        locales: ['en']
      });
      assert.deepEqual(geoIp.get('175.16.199.1'), {
        city: { geoname_id: 2038180, names: { en: 'Changchun' } },
        continent: { code: 'AS', geoname_id: 6255147, names: { en: 'Asia' } },
        country: { geoname_id: 1814991, iso_code: 'CN', names: { en: 'China' } },
        location: {
          latitude: 43.88,
          longitude: 125.3228,
          time_zone: 'Asia/Harbin',
        },
        registered_country: { geoname_id: 1814991, iso_code: 'CN', names: { en: 'China' } },
        subdivisions: [{
          geoname_id: 2036500,
          iso_code: '22',
          names: {
            en: 'Jilin Sheng'
          }
        }]
      });
    });

    it('should trim unwanted locales: whitelist en and ru', function() {
      var geoIp = maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), {
        locales: ['ru', 'es']
      });
      assert.deepEqual(geoIp.get('175.16.199.1'), {
        city: {
          geoname_id: 2038180,
          names: {
            ru: 'Чанчунь'
          }
        },
        continent: {
          code: 'AS',
          geoname_id: 6255147,
          names: {
            es: 'Asia',
            ru: 'Азия'
          }
        },
        country: {
          geoname_id: 1814991,
          iso_code: 'CN',
          names: {
            es: 'China',
            ru: 'Китай'
          }
        },
        location: {
          latitude: 43.88,
          longitude: 125.3228,
          time_zone: 'Asia/Harbin',
        },
        registered_country: {
          geoname_id: 1814991,
          iso_code: 'CN',
          names: {
            es: 'China',
            ru: 'Китай'
          }
        },
        subdivisions: [{
          geoname_id: 2036500,
          iso_code: '22',
          names: {}
        }]
      });
    });

    it('should error when locales is not array', function() {
      assert.throws(function() {
        maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), { locales: 'en' });
      }, /opts.locales should be an array/);
    });

    it('should error when locale is not supported', function() {
      assert.throws(function() {
        maxmind.openSync(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), { locales: ['jp'] });
      }, /opts.locales has unknown values/);
    });
  });
});
