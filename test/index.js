'use strict';

var sinon = require('sinon');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var maxmind = require('../index');
var Reader = require('../lib/reader');

describe('index', function() {
  var dataDir = path.join(__dirname, 'data/test-data');
  var dbPath = path.join(dataDir, 'GeoIP2-City-Test.mmdb');

  var sandbox;
  var watchHandler;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox.stub(fs, 'watch').callsFake(function(path, cb) { watchHandler = cb; });
    sandbox.spy(fs, 'readFile');
    sandbox.spy(fs, 'readFileSync');
  });
  afterEach(function() { sandbox.restore(); });


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
    it('should work with most basic usage', function(done) {
      maxmind.open(dbPath, function(err, lookup) {
        if (err) return done(err);
        assert(lookup.get('2001:230::'));
        done();
      });
    });

    it('should successfully handle database, with opts', function(done) {
      var options = { cache: { max: 1000 }, watchForUpdates: true };
      maxmind.open(dbPath, options, function(err, lookup) {
        if (err) return done(err);
        assert(lookup.get('2001:230::'));
        assert(fs.watch.calledOnce);
        assert(fs.readFile.calledOnce);
        done();
      });
    });

    it('should work with auto updates', function(done) {
      var options = { watchForUpdates: true };
      maxmind.open(dbPath, options, function(err, lookup) {
        if (err) return done(err);
        assert(lookup.get('2001:230::'));
        assert(fs.watch.calledOnce);
        assert(fs.readFile.calledOnce);
        watchHandler();
        assert(fs.readFile.calledTwice);
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

    it('should return an error when gzip file attempted', function(done) {
      var dbPath = path.join(__dirname, 'databases/GeoIP2-City-Test.mmdb.gz');
      maxmind.open(dbPath, function(err) {
        assert.equal(err.message,
          'Looks like you are passing in a file in gzip format, please use mmdb database instead.');
        done();
      });
    });

    it('should check for an error when cannot read database on update', function(done) {
      var counter = 0;
      var cb = function(err, reader) {
        // Indeed couter is kinda gross.
        switch (counter++) {
          case 0:
            assert.equal(err, null);
            assert(reader instanceof Reader);
            assert(fs.readFile.calledOnce);
            fs.readFile.restore();
            sandbox.stub(fs, 'readFile').callsFake(function(path, cb) { cb(new Error('Crazy shit')); });
            watchHandler();
            break;

          case 1:
            assert.equal(err.message, 'Crazy shit');
            done();
            break;

          default:
            done(new Error('Only two calls should happen'));
        }
      };
      maxmind.open(dbPath, { watchForUpdates: true }, cb);
    });

    it('should handler reader errors', function(done) {
      maxmind.open(path.join(__dirname, 'databases/broken.dat'), function(err) {
        assert.equal(err.message, 'Cannot parse binary database');
        done();
      });
    });
  });

  describe('openSync()', function() {
    it('should successfully handle database', function() {
      var lookup = maxmind.openSync(dbPath);
      assert(lookup.get('2001:230::'));
    });

    it('should successfully handle database updates', function() {
      var lookup = maxmind.openSync(dbPath, { watchForUpdates: true });
      assert(lookup.get('2001:230::'));
      assert(fs.watch.calledOnce);
      assert(fs.readFileSync.calledOnce);
      watchHandler();
      assert(fs.readFileSync.calledTwice);
    });
  });
});
