var assert = require('assert');
var path = require('path');
var Reader = require('../lib/reader');
var ipaddr = require('ip-address');


describe('lib/reader', function() {

  var dataDir = __dirname + '/data/test-data';

  describe('findAddressInTree()', function() {

    // it.only('should', () => {
    //   // var b = new Buffer([0x20, 0x01]);
    //   var b = new Buffer([0x20, 0x01, 0x07]);
    //   // var binary = b.toA
    //   const pad = (s) => {
    //     while (s.length < 8) s = '0' + s
    //     return s;
    //   }
    //   const bin = b.toJSON().data.map((n) => pad(n.toString(2))).join('')
    //   const max = b.length * 8
    //   for (var i = 0; i < max; i++) {
    //     var bi = Math.floor(i / 8)
    //     tempBit = 0xFF & rawAddress[parseInt((i - ipStartBit) / 8, 10)];
    //     bit = 1 & (tempBit >> 7 - (i % 8));
    //     console.log(i, bin[i], (b[bi] >> Math.abs((i % 8) - 7)) & 1)
    //     console.log('old', bit)
    //     console.log('--')
    //   }
    // })

    it('should work for most basic case', function() {
      var reader = new Reader(dataDir + '/GeoIP2-City-Test.mmdb');
      assert.equal(reader.findAddressInTree('1.1.1.1'), null);
    });

    it('should return correct value: city database', function() {
      var reader = new Reader(dataDir + '/GeoIP2-City-Test.mmdb');
      assert.equal(reader.findAddressInTree('1.1.1.1'), null);
      assert.equal(reader.findAddressInTree('175.16.199.1'), 3042);
      assert.equal(reader.findAddressInTree('175.16.199.88'), 3042);
      assert.equal(reader.findAddressInTree('175.16.199.255'), 3042);
      assert.equal(reader.findAddressInTree('::175.16.199.255'), 3042);
      assert.equal(reader.findAddressInTree('2a02:cf40:ffff::'), 4735);
      assert.equal(reader.findAddressInTree('2a02:cf47:0000::'), 4735);
      assert.equal(reader.findAddressInTree('2a02:cf47:0000:fff0:ffff::'), 4735);
      assert.equal(reader.findAddressInTree('2a02:cf48:0000::'), null);
    });

    it('should return correct value: string entries', function() {
      var reader = new Reader(dataDir + '/MaxMind-DB-string-value-entries.mmdb');
      assert.equal(reader.findAddressInTree('1.1.1.1'), 98);
      assert.equal(reader.findAddressInTree('1.1.1.2'), 87);
      assert.equal(reader.findAddressInTree('175.2.1.1'), null);
    });

    describe('various record sizes and ip versions', function() {
      var ips = {
        v4: {
          '1.1.1.1': 102,
          '1.1.1.2': 90,
          '1.1.1.32': 114,
          '1.1.1.33': null,
        },
        v6: {
          '::1:ffff:fffa': null,
          '::1:ffff:ffff': 176,
          '::2:0000:0000': 194,
          '::2:0000:0060': null,
        },
        mix: {
          '1.1.1.1': 315,
          '1.1.1.2': 301,
          '1.1.1.32': 329,
          '1.1.1.33': null,
          '::1:ffff:fffa': null,
          '::1:ffff:ffff': 344,
          '::2:0000:0000': 362,
          '::2:0000:0060': null,
        }
      };

      var scenarios = {
        'MaxMind-DB-test-ipv4-24.mmdb': ips.v4,
        'MaxMind-DB-test-ipv4-28.mmdb': ips.v4,
        'MaxMind-DB-test-ipv4-32.mmdb': ips.v4,
        'MaxMind-DB-test-ipv6-24.mmdb': ips.v6,
        'MaxMind-DB-test-ipv6-28.mmdb': ips.v6,
        'MaxMind-DB-test-ipv6-32.mmdb': ips.v6,
        'MaxMind-DB-test-mixed-24.mmdb': ips.mix,
        'MaxMind-DB-test-mixed-28.mmdb': ips.mix,
        'MaxMind-DB-test-mixed-32.mmdb': ips.mix,
      };

      for (var file in scenarios) {
        (function(file, ips) {
          it('should return correct value: ' + file, function() {
            var reader = new Reader(dataDir + '/' + file);
            for (var ip in ips) {
              assert.equal(reader.findAddressInTree(ip), ips[ip], 'IP: ' + ip);
            }
          });
        })(file, scenarios[file]);
      }
    });

    describe('broken files and search trees', function() {
      // NOTE: not sure what's the value of this test
      it.skip('should behave fine when there is no search tree', function() {
        var reader = new Reader(dataDir + '/MaxMind-DB-no-ipv4-search-tree.mmdb');
      });

      it('should behave fine when search tree is broken', function() {
        // TODO: find out in what way the file is broken
        var reader = new Reader(dataDir + '/MaxMind-DB-test-broken-search-tree-24.mmdb');
        assert.equal(reader.findAddressInTree('1.1.1.1'), 102);
        assert.equal(reader.findAddressInTree('1.1.1.2'), 90);
      });
    });
  });
});
