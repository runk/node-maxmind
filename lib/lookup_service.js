var Database    = require('./database'),
  DatabaseInfo = require('./database_info'),
  Location    = require('./location'),
  DynBuffer   = require('./dyn_buffer'),
  countries   = require('./country_data');

var lookupCtr = require('./lookup/country');
var lookupLoc = require('./lookup/location');
var lookupReg = require('./lookup/region');
var lookupOrg = require('./lookup/organization');
var lookupSpd = require('./lookup/speed');

const GEOIP_STANDARD = 0;
const GEOIP_MEMORY_CACHE = 1;
const GEOIP_CHECK_CACHE = 2;
const GEOIP_INDEX_CACHE = 4;

const MAX_RECORD_LENGTH = 4;


var _dbs = [];
var _inited = false;
var _paths = [];

function _getDb(types) {
  for (var i = _dbs.length - 1; i >= 0; i--) {
    if (types.indexOf(_dbs[i].type) > -1)
      return _dbs[i];
  }
  var available = _dbs.map(function(d) {
    return d.type;
  }).join(',');
  throw new Error('Required DB not available. Possible types: "' + available + '"');
}


function _makeCache(db) {
  var buf = new Buffer(2 * MAX_RECORD_LENGTH);

  function _buildIndex(depth, offset) {

    db.dbbuffer.copy(buf, 0, 2 * db.recordLength * offset,
      (2 * db.recordLength * offset) + (2 * MAX_RECORD_LENGTH));

    var x0 = 0,
      x1 = 0,
      y = 0;

    for (var j = 0; j < db.recordLength; j++) {
      y = buf[0 * db.recordLength + j];
      x0 += (y << (j * 8));

      y = buf[1 * db.recordLength + j];
      x1 += (y << (j * 8));
    }

    db.cache[offset] = [ x0, x1 ];

    depth--;

    // cache 10 levels only
    if (depth === 31 - 10)
      return null;

    if ((x0 * 2 * db.recordLength) + (2 * MAX_RECORD_LENGTH) < db.dbbuffer.length)
      _buildIndex(depth, x0);

    if ((x1 * 2 * db.recordLength) + (2 * MAX_RECORD_LENGTH)< db.dbbuffer.length)
      _buildIndex(depth, x1);
  }

  db.cache = {};
  _buildIndex(31, 0);
}


module.exports.ip2Long = function(ip) {
  ip = ip.split('.');

  var c = ip.length;

  ip[0] = parseInt(ip[0], 10) >> 0;
  ip[1] = parseInt(ip[1], 10) >> 0;
  ip[2] = parseInt(ip[2], 10) >> 0;
  ip[3] = parseInt(ip[3], 10) >> 0;

  return ip[0] * (c === 1 || 16777216) +
       ip[1] * (c <= 2 || 65536) +
       ip[2] * (c <= 3 || 256) +
       ip[3] * 1;
};


module.exports.init = function(paths, opts) {

  if (typeof paths === 'string')
    paths = [ paths ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    // already initialized
    if (_paths.indexOf(path) > -1)
      continue;

    _dbs.push(new Database(path, opts));
  }

  _inited = true;
  _paths = paths;

  return true;
};


module.exports.uninit = function() {
  for (var i = _dbs.length - 1; i >= 0; i--) {
    var db = _dbs[i];
    if (db.file) {
      db.file.close();
      db.file = null;
    }
  }

  _dbs = [];
  _paths = [];
  _inited = false;
  return true;
};


module.exports.seekCountry = function(db, ipAddress) {

  if (typeof ipAddress === 'string')
    ipAddress = this.ip2Long(ipAddress);

  if (db.opts.checkForUpdates)
    db.checkForUpdates();

  var buf = new Buffer(2 * MAX_RECORD_LENGTH);

  if (db.cache === null) {
    if (db.opts.memoryCache)
      _makeCache(db);
    else
      db.cache = {};
  }

  var x0 = 0,
    x1 = 0,
    y = 0;

  var offset = 0;

  for (var depth = 31; depth >= 0; depth--) {
    var cache = db.cache[offset];

    if (cache !== undefined) {
      x0 = cache[0];
      x1 = cache[1];
    } else {

      // read from memory
      if (db.opts.memoryCache) {
        buf = new DynBuffer(db.dbbuffer, 2 * db.recordLength * offset, 2 * MAX_RECORD_LENGTH);

      // read from index cache
      } else if (db.opts.indexCache) {
        buf = new DynBuffer(db.indexCache, 2 * db.recordLength * offset, 2 * MAX_RECORD_LENGTH);

      // read from disk
      } else {
        buf = new DynBuffer(new Buffer(2 * MAX_RECORD_LENGTH), 0, 2 * MAX_RECORD_LENGTH);
        db.file.seek(2 * db.recordLength * offset);
        db.file.readFully(buf.source);
      }

      x0 = 0;
      x1 = 0;

      for (var j = 0; j<db.recordLength; j++) {
        y = buf.at(0*db.recordLength+j);
        x0 += (y << (j * 8));

        y = buf.at(1*db.recordLength+j);
        x1 += (y << (j * 8));
      }
    }

    // unfortunately we cannot perform bitwise operations
    // on integers lager than max 2^32
    if (Math.abs(ipAddress & (1 << depth)) > 0) {
      if (x1 >= db.segment) {
        db.lastNetmask = 32 - depth;
        return x1;
      }
      offset = x1;
    } else {
      if (x0 >= db.segment) {
        db.lastNetmask = 32 - depth;
        return x0;
      }
      offset = x0;
    }
  }

  // shouldn't reach here
  return 0;
};


module.exports.getCountry = function(ipAddress) {
  var db = _getDb([
    DatabaseInfo.COUNTRY_EDITION,
    DatabaseInfo.LARGE_COUNTRY_EDITION,
    DatabaseInfo.PROXY_EDITION,
    DatabaseInfo.NETSPEED_EDITION
  ]);

  return lookupCtr(db, this.seekCountry(db, ipAddress));
};


module.exports.getLocation = function(ipnum) {
  var db = _getDb([
    DatabaseInfo.CITY_EDITION_REV0,
    DatabaseInfo.CITY_EDITION_REV1
  ]);

  return lookupLoc(db, this.seekCountry(db, ipnum))
};


module.exports.getRegion = function(ipnum) {
  var db = _getDb([
    DatabaseInfo.REGION_EDITION_REV0,
    DatabaseInfo.REGION_EDITION_REV1
  ]);

  return lookupReg(db, this.seekCountry(db, ipnum));
};


// GeoIP Organization and ISP Edition methods
module.exports.getOrganization = function(ipnum) {
  var db = _getDb([
    DatabaseInfo.ORG_EDITION,
    DatabaseInfo.ISP_EDITION,
    DatabaseInfo.DOMAIN_EDITION,
    DatabaseInfo.ASNUM_EDITION,
    DatabaseInfo.ACCURACYRADIUS_EDITION,
    DatabaseInfo.NETSPEED_EDITION_REV1,
    DatabaseInfo.USERTYPE_EDITION,
    DatabaseInfo.REGISTRAR_EDITION,
    DatabaseInfo.LOCATIONA_EDITION,
    DatabaseInfo.CITYCONF_EDITION,
    DatabaseInfo.COUNTRYCONF_EDITION,
    DatabaseInfo.REGIONCONF_EDITION,
    DatabaseInfo.POSTALCONF_EDITION
  ]);

  return lookupOrg(db, this.seekCountry(db, ipnum));
};
