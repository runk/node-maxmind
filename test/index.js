'use strict';

var assert = require('assert');
var path = require('path');
var maxmind = require('../index');


describe('index', function() {
  var dataDir = path.join(__dirname, 'data/test-data');
  var dbPath = path.join(dataDir, 'GeoIP2-City-Test.mmdb');

  describe('validate()', function() {
    it('should work fine for both IPv4 and IPv6', function() {
      assert.equal(maxmind.validate('64.4.4.4'), true);
      assert.equal(maxmind.validate('2001:4860:0:1001::3004:ef68'), true);
      assert.equal(maxmind.validate('whhaaaazza'), false);
    });
  });

  describe('init()', function() {
    it('should fail when someone tries to use legacy api', function() {
      assert.throws(function() {
        maxmind.init();
      }, /Maxmind v1 module has changed API/);
    });
  });

  describe('open()', function() {
    it('should successfully handle database', function(done) {
      maxmind.open(dbPath, function(err, lookup) {
        if (err) return done(err);
        assert(lookup.get('2001:230::'));
        done();
      });
    });

    it('should successfully handle database, with opts', function(done) {
      maxmind.open(dbPath, { cache: { max: 1000 } }, function(err, lookup) {
        if (err) return done(err);
        assert(lookup.get('2001:230::'));
        done();
      });
    });

    it('should successfully handle errors while opening a db', function(done) {
      maxmind.open('/foo/bar', function(err) {
        assert.equal(err.code, 'ENOENT');
        done();
      });
    });

    it('should throw an error when no callback provided', function() {
      assert.throws(function() {
        maxmind.open(dbPath);
      }, /Callback function must be provided/);
    });
  });

  describe('openSync()', function() {
    it('should successfully handle database', function() {
      var lookup = maxmind.openSync(dbPath);
      assert(lookup.get('2001:230::'));
    });
  });
});
