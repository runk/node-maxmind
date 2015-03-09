var fs = require('fs');

var File = require('./file'),
  DatabaseInfo = require('./database_info');

const GEOIP_STANDARD = 0;
const GEOIP_MEMORY_CACHE = 1;
const GEOIP_CHECK_UPDATES = 2;
const GEOIP_INDEX_CACHE = 4;


function Database(path, opts) {
  this.path = path;
  this.opts = opts || {};
  this.mtime = -1;

  this.dboptions = GEOIP_STANDARD;

  // Ignore `indexCache` when `memoryCache` enabled, since it doesn't make sense
  if (this.opts.memoryCache) delete this.opts.indexCache;

  if (this.opts.indexCache)  this.dboptions |= GEOIP_INDEX_CACHE;
  if (this.opts.memoryCache) this.dboptions |= GEOIP_MEMORY_CACHE;
  if (this.opts.checkForUpdates) this.dboptions |= GEOIP_CHECK_UPDATES;

  this.init();
};


Database.prototype.init = function() {
  this.indexCache = null;
  this.lastNetmask = null;
  this.dbbuffer = null;
  this.cache = null;

  if (this.file)
    this.file.close();

  this.file = new File(this.path);
  this.info = new DatabaseInfo(this.file);

  this.segment = this.info.segment;
  this.recordLength = this.info.recordLength;
  this.type = this.info.type;

  var l;
  if (this.opts.memoryCache) {
    l = this.file.length();
    this.dbbuffer = new Buffer(l);
    this.file.seek(0);
    this.file.readFully(this.dbbuffer, 0, l);
    this.file.close();
  }

  if (this.opts.indexCache) {
    l = this.segment * this.recordLength * 2;
    this.indexCache = new Buffer(l);
    if (this.indexCache !== null) {
      this.file.seek(0);
      this.file.readFully(this.indexCache, 0, l);
    }
  } else {
    this.indexCache = null;
  }
};


Database.prototype.checkForUpdates = function() {

  var mtime = fs.lstatSync(this.path).mtime.valueOf();

  // set initial value
  if (this.mtime === -1)
    return this.mtime = mtime;

  // check for updates/modifications
  if (this.mtime === mtime)
    return;

  this.mtime = mtime;
  this.init();
};


module.exports = Database
