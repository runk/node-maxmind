var assert = require('assert'),
  Database = require('../lib/database'),
  DatabaseInfo = require('../lib/database_info');

const GEO_CITY = __dirname + '/dbs/GeoIPCity.dat';


describe('lib/database', function() {

  var db;
  describe('constructor()', function() {
    it('should return new instance of Database', function() {
      db = new Database(GEO_CITY);
      assert.ok(db instanceof Database);
      assert.ok('indexCache' in db);
      assert.ok('lastNetmask' in db);
      assert.ok('file' in db);
      assert.ok('dbbuffer' in db);
      assert.ok('cache' in db);
      assert.ok('path' in db);
      assert.ok('dboptions' in db);
      assert.ok('segment' in db);
      assert.ok('recordLength' in db);
      assert.ok('type' in db);
    });

    it('should throw error for invalid path', function() {
      assert.throws(function() {
        new Database('/crazy/shit');
      });
    });

    it('should work fine with opts', function() {
      db = new Database(GEO_CITY, { indexCache: true });
      assert.equal(db.dboptions, 4)
    });
  });


  describe('info', function() {
    it('should return database info', function() {
      assert.ok(db.info instanceof DatabaseInfo);
      assert.equal(db.info.type, DatabaseInfo.CITY_EDITION_REV1);
      assert.equal(db.info.segment, 2779114);
      assert.equal(db.info.recordLength, 3);
      assert.equal(db.info.info,
        'GEO-533LITE 20130219 Build 1 Copyright (c) 2012 MaxMind Inc All Rights Reserved');
      assert.equal(db.info.isPremium, false);
      assert.equal(db.info.date.getTime(), 1361232000000)
    });
  });
});
