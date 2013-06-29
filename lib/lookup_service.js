var Buff        = require('./buff'),
    DatabaseInfo = require('./database_info'),
    Country     = require('./country'),
    Location    = require('./location'),
    Region      = require('./region'),
    DynBuffer   = require('./dyn_buffer'),
    countries   = require('./country_data');


const US_OFFSET = 1;
const CANADA_OFFSET = 677;
const WORLD_OFFSET = 1353;
const FIPS_RANGE = 360;
const COUNTRY_BEGIN = 16776960;
const STATE_BEGIN_REV0 = 16700000;
const STATE_BEGIN_REV1 = 16000000;
const STRUCTURE_INFO_MAX_SIZE = 20;
const DATABASE_INFO_MAX_SIZE = 100;
const GEOIP_STANDARD = 0;
const GEOIP_MEMORY_CACHE = 1;
const GEOIP_CHECK_CACHE = 2;
const GEOIP_INDEX_CACHE = 4;
const GEOIP_UNKNOWN_SPEED = 0;
const GEOIP_DIALUP_SPEED = 1;
const GEOIP_CABLEDSL_SPEED = 2;
const GEOIP_CORPORATE_SPEED = 3;
const SEGMENT_RECORD_LENGTH = 3;
const STANDARD_RECORD_LENGTH = 3;
const ORG_RECORD_LENGTH = 4;
const MAX_RECORD_LENGTH = 4;
const MAX_ORG_RECORD_LENGTH = 300;
const FULL_RECORD_LENGTH = 60;
const UNKNOWN_COUNTRY = new Country("--", "N/A");


var dboptions = null;
var databaseType = DatabaseInfo.COUNTRY_EDITION;
var databaseSegment = null;
var recordLength = 0;
var indexCache = new Buffer(0);
var lastNetmask;
var file;
var dbbuffer;

function _getDatabaseInfo() {

    var hasStructureInfo = false;
    var delim = new Buffer(3);

    // Advance to part of file where database info is stored.
    file.seek(file.length() - 3);
    for (var i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);
        if (delim[0] === 255 && delim[1] === 255 && delim[2] === 255) {
            hasStructureInfo = true;
            break;
        }
        file.seek(file.getFilePointer() - 4);
    }

    if (hasStructureInfo) {
        file.seek(file.getFilePointer() - 6);
    } else {
        // No structure info, must be pre Sep 2002 database, go back to end.
        file.seek(file.length() - 3);
    }

    // Find the database info string.
    for (i = 0; i < DATABASE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);
        if (delim[0] + delim[1] + delim[2] === 0) {
            var dbInfo = new Buffer(i);
            file.readFully(dbInfo);
            return new DatabaseInfo(dbInfo);
        }
        file.seek(file.getFilePointer() - 4);
    }
    return null;
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

module.exports.databaseInfo = null;
module.exports.inited = false;
module.exports.path = null;
module.exports.init = function(path, opts) {

    // already initialized
    if (path === this.path && this.inited)
        return true;

    dboptions = GEOIP_STANDARD;

    if (opts !== undefined && opts.indexCache)
        dboptions |= GEOIP_INDEX_CACHE;

    if (opts !== undefined && opts.memoryCache)
        dboptions |= GEOIP_MEMORY_CACHE;

    file = new Buff(path);

    _cache = null;

    var i, j, l;
    var delim = new Buffer(3);
    var buf = new Buffer(SEGMENT_RECORD_LENGTH);

    if (!file)
        throw new Error('Invalid file');

    file.seek(file.length() - 3);

    for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);

        if (delim.readInt8(0) === -1 && delim.readInt8(1) === -1 && delim.readInt8(2) === -1) {
            databaseType = file.readByte();

            if (databaseType >= 106) {
                // Backward compatibility with databases from April 2003 and earlier
                databaseType -= 105;
            }

            // Determine the database type.
            if (databaseType === DatabaseInfo.REGION_EDITION_REV0) {
                databaseSegment = STATE_BEGIN_REV0;
                recordLength = STANDARD_RECORD_LENGTH;

            } else if (databaseType === DatabaseInfo.REGION_EDITION_REV1){
                databaseSegment = STATE_BEGIN_REV1;
                recordLength = STANDARD_RECORD_LENGTH;

            } else if (databaseType === DatabaseInfo.CITY_EDITION_REV0 ||
                       databaseType === DatabaseInfo.CITY_EDITION_REV1 ||
                       databaseType === DatabaseInfo.ORG_EDITION ||
                       databaseType === DatabaseInfo.ORG_EDITION_V6 ||
                       databaseType === DatabaseInfo.ISP_EDITION ||
                       databaseType === DatabaseInfo.ISP_EDITION_V6 ||
                       databaseType === DatabaseInfo.DOMAIN_EDITION ||
                       databaseType === DatabaseInfo.DOMAIN_EDITION_V6 ||
                       databaseType === DatabaseInfo.ASNUM_EDITION ||
                       databaseType === DatabaseInfo.ASNUM_EDITION_V6 ||
                       databaseType === DatabaseInfo.NETSPEED_EDITION_REV1 ||
                       databaseType === DatabaseInfo.NETSPEED_EDITION_REV1_V6 ||
                       databaseType === DatabaseInfo.CITY_EDITION_REV0_V6 ||
                       databaseType === DatabaseInfo.CITY_EDITION_REV1_V6
            ) {
                databaseSegment = 0;

                if (databaseType === DatabaseInfo.CITY_EDITION_REV0 ||
                    databaseType === DatabaseInfo.CITY_EDITION_REV1 ||
                    databaseType === DatabaseInfo.ASNUM_EDITION_V6 ||
                    databaseType === DatabaseInfo.NETSPEED_EDITION_REV1 ||
                    databaseType === DatabaseInfo.NETSPEED_EDITION_REV1_V6 ||
                    databaseType === DatabaseInfo.CITY_EDITION_REV0_V6 ||
                    databaseType === DatabaseInfo.CITY_EDITION_REV1_V6 ||
                    databaseType === DatabaseInfo.ASNUM_EDITION
                ) {
                    recordLength = STANDARD_RECORD_LENGTH;
                } else {
                    recordLength = ORG_RECORD_LENGTH;
                }

                file.readFully(buf);
                for (j = 0; j < SEGMENT_RECORD_LENGTH; j++) {
                    databaseSegment += buf.readUInt8(j) << (j * 8);
                }
            }
            break;
        } else {
            file.seek(file.getFilePointer() - 4);
        }
    }

    if (databaseType === DatabaseInfo.COUNTRY_EDITION ||
        databaseType === DatabaseInfo.COUNTRY_EDITION_V6 ||
        databaseType === DatabaseInfo.PROXY_EDITION ||
        databaseType === DatabaseInfo.NETSPEED_EDITION
    ) {
        databaseSegment = COUNTRY_BEGIN;
        recordLength = STANDARD_RECORD_LENGTH;
    }

    this.databaseInfo = _getDatabaseInfo();

    if ((dboptions & GEOIP_MEMORY_CACHE) !== 0) {
        l = file.length();
        dbbuffer = new Buffer(l);
        file.seek(0);
        file.readFully(dbbuffer, 0, l);
        file.close();
    }

    if ((dboptions & GEOIP_INDEX_CACHE) !== 0) {
        l = databaseSegment * recordLength * 2;
        indexCache = new Buffer(l);
        if (indexCache !== null) {
            file.seek(0);
            file.readFully(indexCache, 0, l);
        }
    } else {
        indexCache = null;
    }

    this.inited = true;
    this.path = path;

    return true;
};

var _cache = null;

function _makeCache() {
    var buf = new Buffer(2 * MAX_RECORD_LENGTH);

    function _buildIndex(depth, offset) {

        dbbuffer.copy(buf, 0, 2 * recordLength * offset, (2 * recordLength * offset) + (2 * MAX_RECORD_LENGTH));

        var x0 = 0,
            x1 = 0,
            y = 0;

        for (var j = 0; j<recordLength; j++) {
            y = buf[0*recordLength+j];
            x0 += (y << (j * 8));

            y = buf[1*recordLength+j];
            x1 += (y << (j * 8));
        }

        _cache[offset] = [ x0, x1 ];

        depth--;

        // cache 10 levels only
        if (depth === 31 - 10)
            return null;

        if ((x0 * 2 * recordLength) + (2 * MAX_RECORD_LENGTH) < dbbuffer.length)
            _buildIndex(depth, x0);

        if ((x1 * 2 * recordLength) + (2 * MAX_RECORD_LENGTH)< dbbuffer.length)
            _buildIndex(depth, x1);
    }

    _cache = {};
    _buildIndex(31, 0);
}

module.exports.seekCountry = function(ipAddress) {

    var buf = new Buffer(2 * MAX_RECORD_LENGTH);

    if (_cache === null) {
        if ((dboptions & GEOIP_MEMORY_CACHE) !== 0)
            _makeCache();
        else
            _cache = {};
    }

    var x0 = 0,
        x1 = 0,
        y = 0;

    var offset = 0;

    for (var depth = 31; depth >= 0; depth--) {
        var cache = _cache[offset];

        if (cache !== undefined) {
            x0 = cache[0];
            x1 = cache[1];
        } else {

            // read from memory
            if ((dboptions & GEOIP_MEMORY_CACHE) !== 0) {
                buf = new DynBuffer(dbbuffer, 2 * recordLength * offset, 2 * MAX_RECORD_LENGTH);

            // read from index cache
            } else if ((dboptions & GEOIP_INDEX_CACHE) !== 0) {
                buf = new DynBuffer(indexCache, 2 * recordLength * offset, 2 * MAX_RECORD_LENGTH);

            // read from disk
            } else {
                buf = new DynBuffer(new Buffer(2 * MAX_RECORD_LENGTH), 0, 2 * MAX_RECORD_LENGTH);
                file.seek(2 * recordLength * offset);
                file.readFully(buf.source);
            }

            x0 = 0;
            x1 = 0;

            for (var j = 0; j<recordLength; j++) {
                y = buf.at(0*recordLength+j);
                x0 += (y << (j * 8));

                y = buf.at(1*recordLength+j);
                x1 += (y << (j * 8));
            }
        }

        // unfortunately we cannot perform bitwise operations
        // on integers lager than max 2^32
        if (Math.abs(ipAddress & (1 << depth)) > 0) {
            if (x1 >= databaseSegment) {
                lastNetmask = 32 - depth;
                return x1;
            }
            offset = x1;
        } else {
            if (x0 >= databaseSegment) {
                lastNetmask = 32 - depth;
                return x0;
            }
            offset = x0;
        }
    }

    // shouldn't reach here
    return 0;
};

module.exports.getCountry = function(ipAddress) {
    if (typeof ipAddress === "string")
        ipAddress = this.ip2Long(ipAddress);

    var ret = this.seekCountry(ipAddress) - COUNTRY_BEGIN;

    if (ret === 0)
        return UNKNOWN_COUNTRY;

    return new Country(countries.codes[ret], countries.names[ret]);
};

module.exports.getLocation = function(ipnum) {

    if (typeof ipnum === "string")
        ipnum = this.ip2Long(ipnum);

    var recordPointer;
    var recordBuf;
    var recordBufOffset = 0;

    var record = new Location();

    var pointer = 0;
    var j, seekCountry;
    var latitude = 0, longitude = 0;


    seekCountry = this.seekCountry(ipnum);

    if (seekCountry === databaseSegment)
        return null;

    recordPointer = seekCountry + (2 * recordLength - 1) * databaseSegment;

    if ((dboptions & GEOIP_MEMORY_CACHE) !== 0) {
        recordBuf = new DynBuffer(dbbuffer, recordPointer,
            Math.min(dbbuffer.length - recordPointer, FULL_RECORD_LENGTH));
    } else {
        //read from disk
        recordBuf = new DynBuffer(new Buffer(FULL_RECORD_LENGTH), 0, FULL_RECORD_LENGTH);
        file.seek(recordPointer);
        file.readFully(recordBuf.source);
    }


    // get country
    record.countryCode = countries.codes[recordBuf.readUInt8(0)];
    record.countryName = countries.names[recordBuf.readUInt8(0)];
    recordBufOffset++;


    // get region
    while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
        pointer++;

    if (pointer > 0)
        record.region = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

    recordBufOffset += pointer + 1;
    pointer = 0;


    // get city
    while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
        pointer++;

    if (pointer > 0)
        record.city = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

    recordBufOffset += pointer + 1;
    pointer = 0;


    // get postal code
    while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
        pointer++;

    if (pointer > 0)
        record.postalCode = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

    recordBufOffset += pointer + 1;

    // get latitude
    latitude = (recordBuf.readUInt8(recordBufOffset + 0) << (0 * 8)) +
               (recordBuf.readUInt8(recordBufOffset + 1) << (1 * 8)) +
               (recordBuf.readUInt8(recordBufOffset + 2) << (2 * 8));

    record.latitude = latitude/10000 - 180;
    recordBufOffset += 3;

    // get longitude
    longitude = (recordBuf.readUInt8(recordBufOffset + 0) << (0 * 8)) +
                (recordBuf.readUInt8(recordBufOffset + 1) << (1 * 8)) +
                (recordBuf.readUInt8(recordBufOffset + 2) << (2 * 8));

    record.longitude = longitude/10000 - 180;

    record.dmaCode = record.metroCode = 0;
    record.areaCode = 0;

    if (databaseType === DatabaseInfo.CITY_EDITION_REV1) {
        // get DMA code
        var metroareaCombo = 0;
        if (record.countryCode === "US") {
            recordBufOffset += 3;

            for (j = 0; j < 3; j++)
                metroareaCombo += recordBuf.readUInt8(recordBufOffset + j) << (j * 8);

            record.metroCode = record.dmaCode = metroareaCombo/1000;
            record.areaCode = metroareaCombo % 1000;
        }
    }

    return record;
};

module.exports.getRegion = function(ipnum) {

    if (typeof ipnum === "string")
        ipnum = this.ip2Long(ipnum);

    var record = new Region();
    var seekRegion = 0;

    if (databaseType === DatabaseInfo.REGION_EDITION_REV0) {
        seekRegion = this.seekCountry(ipnum) - STATE_BEGIN_REV0;

        if (seekRegion >= 1000) {
            record.countryCode = "US";
            record.countryName = "United States";
            record.region = String.fromCharCode(
                ((seekRegion - 1000) / 26) + 65,
                ((seekRegion - 1000) % 26) + 65
            );

        } else {
            record.countryCode = countries.codes[seekRegion];
            record.countryName = countries.names[seekRegion];
            record.region = "";
        }

    } else if (databaseType === DatabaseInfo.REGION_EDITION_REV1) {
        seekRegion = this.seekCountry(ipnum) - STATE_BEGIN_REV1;

        if (seekRegion < US_OFFSET) {
            record.countryCode = "";
            record.countryName = "";
            record.region = "";

        } else if (seekRegion < CANADA_OFFSET) {
            record.countryCode = "US";
            record.countryName = "United States";
            record.region = String.fromCharCode(
                ((seekRegion - US_OFFSET)/26) + 65,
                ((seekRegion - US_OFFSET)%26) + 65
            );

        } else if (seekRegion < WORLD_OFFSET) {
            record.countryCode = "CA";
            record.countryName = "Canada";
            record.region = String.fromCharCode(
                ((seekRegion - CANADA_OFFSET)/26) + 65,
                ((seekRegion - CANADA_OFFSET)%26) + 65
            );

        } else {
            record.countryCode = countries.codes[(seekRegion - WORLD_OFFSET) / FIPS_RANGE];
            record.countryName = countries.names[(seekRegion - WORLD_OFFSET) / FIPS_RANGE];
            record.region = "";
        }
    }
    return record;
};

// GeoIP Organization and ISP Edition methods
module.exports.getOrganization = function(ipnum) {

    if (typeof ipnum === "string")
        ipnum = this.ip2Long(ipnum);

    var seekCountry,
        recordPointer,
        recordBuf,
        pointer = 0;

    seekCountry = this.seekCountry(ipnum);

    if (seekCountry === databaseSegment)
        return null;

    recordPointer = seekCountry + (2 * recordLength - 1) * databaseSegment;
    if ((dboptions & GEOIP_MEMORY_CACHE) !== 0) {
        recordBuf = new DynBuffer(dbbuffer, recordPointer,
            Math.min(dbbuffer.length - recordPointer, MAX_ORG_RECORD_LENGTH));
    } else {
        //read from disk
        recordBuf = new DynBuffer(new Buffer(MAX_ORG_RECORD_LENGTH), 0, MAX_ORG_RECORD_LENGTH);
        file.seek(recordPointer);
        file.readFully(recordBuf.source);
    }

    while (recordBuf.at(++pointer) !== 0x00);

    return recordBuf.toString('utf8', 0, pointer);
};

module.exports.uninit = function() {
    this.databaseInfo = null;
    this.inited = false;
    dboptions = GEOIP_STANDARD;

    if (file) {
        file.close();
        file = null;
    }

    _cache = null;
    return true;
};
