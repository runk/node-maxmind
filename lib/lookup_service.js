var Database    = require('./database'),
  DatabaseInfo = require('./database_info'),
  DynBuffer   = require('./dyn_buffer');

var lookupCtr = require('./lookup/country');
var lookupLoc = require('./lookup/location');
var lookupReg = require('./lookup/region');
var lookupOrg = require('./lookup/organization');
var lookupSpd = require('./lookup/speed');
var ip = require('./ip');

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
    if (~types.indexOf(_dbs[i].type))
      return _dbs[i];
  }

  var available = _dbs.map(function(d) {
    return d.type;
  }).join(',');
  throw new Error('Required DB not available. Possible types: "' + available + '"');
}

exports.getDb = _getDb;


exports.init = function(paths, opts) {

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


exports.uninit = function() {
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


exports.seekCountry = function(db, ipAddress) {

  if (typeof ipAddress === 'string')
    ipAddress = ip.v4ToLong(ipAddress);

  if (db.opts.checkForUpdates)
    db.checkForUpdates();


  var buf;
  var x0 = 0, x1 = 0, y = 0;
  var offset = 0;

  for (var depth = 31; depth >= 0; depth--) {

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

    x0 = x1 = 0;
    for (var j = 0; j < db.recordLength; j++) {
      y = buf.at(0 * db.recordLength + j);
      x0 += (y << (j * 8));

      y = buf.at(1 * db.recordLength + j);
      x1 += (y << (j * 8));
    }

    // unfortunately we cannot perform bitwise operations
    // on integers lager than 2^32
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

  throw new Error('Should not reach here');
};

// https://github.com/whitequark/ipaddr.js/blob/master/test/ipaddr.test.coffee
exports.seekCountryV6 = function(db, ipAddress) {
  var v6vec = typeof ipAddress === 'string' ? ip.v6ToArray(ipAddress) : ipAddress;

  if (db.opts.checkForUpdates)
    db.checkForUpdates();

  var buf;
  var offset = 0;

  var x0, x1, y;
  var depth, i, i;

  var bnum, idx, b_mask;

  for (depth = 127; depth >= 0; depth--) {
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

    x0 = x1 = 0;
    for (j = 0; j < db.recordLength; j++) {
      y = buf.at(0 * db.recordLength + j);
      x0 += (y << (j * 8));

      y = buf.at(1 * db.recordLength + j);
      x1 += (y << (j * 8));
    }

    bnum = 127 - depth;
    idx = bnum >> 3;
    b_mask = 1 << (bnum & 7 ^ 7);

    if ((v6vec[idx] & b_mask) > 0) {
      if (x1 >= db.segment) {
        db.lastNetmask = 128 - depth;
        return x1;
      }
      offset = x1;
    } else {
      if (x0 >= db.segment) {
        db.lastNetmask = 128 - depth;
        return x0;
      }
      offset = x0;
    }
  }

  throw new Error('Should not reach here');
};


exports.getCountry = function(ipv4) {
  var db = _getDb([
    DatabaseInfo.COUNTRY_EDITION,
    DatabaseInfo.LARGE_COUNTRY_EDITION,
    DatabaseInfo.PROXY_EDITION,
    DatabaseInfo.NETSPEED_EDITION
  ]);

  return lookupCtr(db, this.seekCountry(db, ipv4));
};


exports.getCountryV6 = function(ipv6) {
  var db = _getDb([
    DatabaseInfo.COUNTRY_EDITION_V6
  ]);

  return lookupCtr(db, this.seekCountryV6(db, ipv6));
};


exports.getLocation = function(ipv4) {
  var db = _getDb([
    DatabaseInfo.CITY_EDITION_REV0,
    DatabaseInfo.CITY_EDITION_REV1
  ]);

  return lookupLoc(db, this.seekCountry(db, ipv4));
};

exports.getLocationV6 = function(ipv6) {
  var db = _getDb([
    DatabaseInfo.CITY_EDITION_REV0_V6,
    DatabaseInfo.CITY_EDITION_REV1_V6
  ]);

  return lookupLoc(db, this.seekCountryV6(db, ipv6));
};


exports.getRegion = function(ipv4) {
  var db = _getDb([
    DatabaseInfo.REGION_EDITION_REV0,
    DatabaseInfo.REGION_EDITION_REV1
  ]);

  return lookupReg(db, this.seekCountry(db, ipv4));
};


// GeoIP Organization and ISP Edition methods
exports.getOrganization = function(ipv4) {
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
  ]);

  return lookupOrg(db, this.seekCountry(db, ipv4));
};


exports.getOrganizationV6 = function(ipv6) {
  var db = _getDb([
    DatabaseInfo.ORG_EDITION_V6,
    DatabaseInfo.ORG_EDITION_V6,
    DatabaseInfo.ISP_EDITION_V6,
    DatabaseInfo.DOMAIN_EDITION_V6,
    DatabaseInfo.ASNUM_EDITION_V6,
    DatabaseInfo.ACCURACYRADIUS_EDITION_V6,
    DatabaseInfo.NETSPEED_EDITION_REV1_V6,
    DatabaseInfo.USERTYPE_EDITION_v6,
    DatabaseInfo.REGISTRAR_EDITION_V6,
    DatabaseInfo.LOCATIONA_EDITION_V6
  ]);

  return lookupOrg(db, this.seekCountryV6(db, ipv6));
};

exports.getSpeed = function(ipnum) {
  var db = _getDb([
    DatabaseInfo.NETSPEED_EDITION_REV1,
    DatabaseInfo.NETSPEED_EDITION
  ]);

  var seek = this.seekCountry(db, ipnum);
  return lookupSpd(db, seek);
};
