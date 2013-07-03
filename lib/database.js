var Buff = require('./buff'),
    DatabaseInfo = require('./database_info');

const GEOIP_STANDARD = 0;
const GEOIP_MEMORY_CACHE = 1;
const GEOIP_CHECK_CACHE = 2;
const GEOIP_INDEX_CACHE = 4;

module.exports = function Database(path, opts) {

    this.indexCache = null;
    this.lastNetmask = null;
    this.file = null;
    this.dbbuffer = null;
    this.cache = null;
    this.path = path;

    this.dboptions = GEOIP_STANDARD;

    if (opts !== undefined && opts.indexCache)
        this.dboptions |= GEOIP_INDEX_CACHE;

    if (opts !== undefined && opts.memoryCache)
        this.dboptions |= GEOIP_MEMORY_CACHE;

    this.file = new Buff(path);

    if (!this.file)
        throw new Error('Invalid file');

    this.info = new DatabaseInfo(this.file);

    this.segment = this.info.segment;
    this.recordLength = this.info.recordLength;
    this.type = this.info.type;

    var l;
    if ((this.dboptions & GEOIP_MEMORY_CACHE) !== 0) {
        l = this.file.length();
        this.dbbuffer = new Buffer(l);
        this.file.seek(0);
        this.file.readFully(this.dbbuffer, 0, l);
        this.file.close();
    }

    if ((this.dboptions & GEOIP_INDEX_CACHE) !== 0) {
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
