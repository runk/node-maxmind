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

  if (opts) {
    if (opts.indexCache)  this.dboptions |= GEOIP_INDEX_CACHE;
    if (opts.memoryCache) this.dboptions |= GEOIP_MEMORY_CACHE;
    if (opts.checkForUpdates)  this.dboptions |= GEOIP_CHECK_UPDATES;
  }
  
  if (opts.networkBuff) {
    Buff = require('./network-buff');
    this.networkInit();
  } else {
    this.init();
  }
};

Database.prototype.networkInit = function() {
  this.indexCache = null;
  this.lastNetmask = null;
  this.dbbuffer = null;
  this.cache = null;

  var self = this;
  this.file = new Buff(this.path, function(complete) {
    if(!complete) {
      throw "Network buffer didn't initialize";
    }
    self.info = new DatabaseInfo(self.file);

    self.segment = self.info.segment;
    self.recordLength = self.info.recordLength;
    self.type = self.info.type;

    var l;
    if (self.opts.memoryCache) {
      l = self.file.length();
      this.dbbuffer = new Buffer(l);
      self.file.seek(0);
      self.file.readFully(self.dbbuffer, 0, l);
      self.file.close();
    }

    if (this.opts.indexCache) {
      l = self.segment * self.recordLength * 2;
      self.indexCache = new Buffer(l);
      if (self.indexCache !== null) {
        self.file.seek(0);
        self.file.readFully(self.indexCache, 0, l);
      }
    } else {
      self.indexCache = null;
    }

    });
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
