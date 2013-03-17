
var Buff = require('./buff'),
    DatabaseInfo = require('./database_info'),
    Country = require('./country'),
    Location = require('./location'),
    Region = require('./region'),
    DynBuffer = require('./dyn_buffer');

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

var countryCode = [
    "--","AP","EU","AD","AE","AF","AG","AI","AL","AM","CW",
    "AO","AQ","AR","AS","AT","AU","AW","AZ","BA","BB",
    "BD","BE","BF","BG","BH","BI","BJ","BM","BN","BO",
    "BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD",
    "CF","CG","CH","CI","CK","CL","CM","CN","CO","CR",
    "CU","CV","CX","CY","CZ","DE","DJ","DK","DM","DO",
    "DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ",
    "FK","FM","FO","FR","SX","GA","GB","GD","GE","GF",
    "GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT",
    "GU","GW","GY","HK","HM","HN","HR","HT","HU","ID",
    "IE","IL","IN","IO","IQ","IR","IS","IT","JM","JO",
    "JP","KE","KG","KH","KI","KM","KN","KP","KR","KW",
    "KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT",
    "LU","LV","LY","MA","MC","MD","MG","MH","MK","ML",
    "MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV",
    "MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI",
    "NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF",
    "PG","PH","PK","PL","PM","PN","PR","PS","PT","PW",
    "PY","QA","RE","RO","RU","RW","SA","SB","SC","SD",
    "SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO",
    "SR","ST","SV","SY","SZ","TC","TD","TF","TG","TH",
    "TJ","TK","TM","TN","TO","TL","TR","TT","TV","TW",
    "TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE",
    "VG","VI","VN","VU","WF","WS","YE","YT","RS","ZA",
    "ZM","ME","ZW","A1","A2","O1","AX","GG","IM","JE",
    "BL","MF", "BQ", "SS", "O1"
];

var countryName = [
    "N/A","Asia/Pacific Region","Europe","Andorra","United Arab Emirates","Afghanistan","Antigua and Barbuda","Anguilla","Albania","Armenia","Curacao",
    "Angola","Antarctica","Argentina","American Samoa","Austria","Australia","Aruba","Azerbaijan","Bosnia and Herzegovina","Barbados",
    "Bangladesh","Belgium","Burkina Faso","Bulgaria","Bahrain","Burundi","Benin","Bermuda","Brunei Darussalam","Bolivia",
    "Brazil","Bahamas","Bhutan","Bouvet Island","Botswana","Belarus","Belize","Canada","Cocos (Keeling) Islands","Congo, The Democratic Republic of the",
    "Central African Republic","Congo","Switzerland","Cote D'Ivoire","Cook Islands","Chile","Cameroon","China","Colombia","Costa Rica",
    "Cuba","Cape Verde","Christmas Island","Cyprus","Czech Republic","Germany","Djibouti","Denmark","Dominica","Dominican Republic",
    "Algeria","Ecuador","Estonia","Egypt","Western Sahara","Eritrea","Spain","Ethiopia","Finland","Fiji",
    "Falkland Islands (Malvinas)","Micronesia, Federated States of","Faroe Islands","France","Sint Maarten (Dutch part)","Gabon","United Kingdom",
    "Grenada","Georgia","French Guiana",
    "Ghana","Gibraltar","Greenland","Gambia","Guinea","Guadeloupe","Equatorial Guinea","Greece","South Georgia and the South Sandwich Islands","Guatemala",
    "Guam","Guinea-Bissau","Guyana","Hong Kong","Heard Island and McDonald Islands","Honduras","Croatia","Haiti","Hungary","Indonesia",
    "Ireland","Israel","India","British Indian Ocean Territory","Iraq","Iran, Islamic Republic of","Iceland","Italy","Jamaica","Jordan",
    "Japan","Kenya","Kyrgyzstan","Cambodia","Kiribati","Comoros","Saint Kitts and Nevis","Korea, Democratic People's Republic of","Korea, Republic of","Kuwait",
    "Cayman Islands","Kazakhstan","Lao People's Democratic Republic","Lebanon","Saint Lucia","Liechtenstein","Sri Lanka","Liberia","Lesotho","Lithuania",
    "Luxembourg","Latvia","Libya","Morocco","Monaco","Moldova, Republic of","Madagascar","Marshall Islands","Macedonia","Mali",
    "Myanmar","Mongolia","Macau","Northern Mariana Islands","Martinique","Mauritania","Montserrat","Malta","Mauritius","Maldives",
    "Malawi","Mexico","Malaysia","Mozambique","Namibia","New Caledonia","Niger","Norfolk Island","Nigeria","Nicaragua",
    "Netherlands","Norway","Nepal","Nauru","Niue","New Zealand","Oman","Panama","Peru","French Polynesia",
    "Papua New Guinea","Philippines","Pakistan","Poland","Saint Pierre and Miquelon","Pitcairn Islands","Puerto Rico","Palestinian Territory","Portugal","Palau",
    "Paraguay","Qatar","Reunion","Romania","Russian Federation","Rwanda","Saudi Arabia","Solomon Islands","Seychelles","Sudan",
    "Sweden","Singapore","Saint Helena","Slovenia","Svalbard and Jan Mayen","Slovakia","Sierra Leone","San Marino","Senegal","Somalia","Suriname",
    "Sao Tome and Principe","El Salvador","Syrian Arab Republic","Swaziland","Turks and Caicos Islands","Chad","French Southern Territories","Togo","Thailand",
    "Tajikistan","Tokelau","Turkmenistan","Tunisia","Tonga","Timor-Leste","Turkey","Trinidad and Tobago","Tuvalu","Taiwan",
    "Tanzania, United Republic of","Ukraine","Uganda","United States Minor Outlying Islands","United States","Uruguay","Uzbekistan",
    "Holy See (Vatican City State)","Saint Vincent and the Grenadines","Venezuela",
    "Virgin Islands, British","Virgin Islands, U.S.","Vietnam","Vanuatu","Wallis and Futuna","Samoa","Yemen","Mayotte","Serbia","South Africa",
    "Zambia","Montenegro","Zimbabwe","Anonymous Proxy","Satellite Provider","Other","Aland Islands","Guernsey","Isle of Man","Jersey",
    "Saint Barthelemy","Saint Martin", "Bonaire, Saint Eustatius and Saba",
    "South Sudan", "Other"
];


var dboptions = GEOIP_MEMORY_CACHE;
var databaseType = DatabaseInfo.COUNTRY_EDITION;
var databaseSegments = [];
var recordLength = 0;
var index_cache = new Buffer(0);
var databaseInfo = null;
var mtime;
var last_netmask;
var file;
var dbbuffer;

function _getDatabaseInfo() {

    var hasStructureInfo = false;
    var delim = new Buffer(3);

    // Advance to part of file where database info is stored.
    file.seek(file.length() - 3);
    for (var i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
        var read = file.readFully(delim);
        if (read == 3 && (delim[0]&0xFF) == 255 && (delim[1]&0xFF) == 255 && (delim[2]&0xFF) == 255) {
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
    for (var i=0; i<DATABASE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);
        if (delim[0]==0 && delim[1]==0 && delim[2]==0) {
            var dbInfo = new Buffer(i);
            file.readFully(dbInfo);
            return new DatabaseInfo(dbInfo);
        }
        file.seek(file.getFilePointer() -4);
    }
    return null;
};

function _check_mtime() {
    // do noting atm
};

module.exports.ip2Long = function(ip) {
    ip = ip.split('.');

    var c = ip.length;

    ip[0] = parseInt(ip[0]) >> 0;
    ip[1] = parseInt(ip[1]) >> 0;
    ip[2] = parseInt(ip[2]) >> 0;
    ip[3] = parseInt(ip[3]) >> 0;

    return ip[0] * (c === 1 || 16777216)
         + ip[1] * (c <= 2 || 65536)
         + ip[2] * (c <= 3 || 256)
         + ip[3] * 1;
};

module.exports.databaseInfo = null;
module.exports.inited = false;
module.exports.path = null;
module.exports.init = function(path) {

    if (path == this.path && this.inited)
        return true;

    file = new Buff(path);

    _cache = null;

    var i, j;
    var delim = new Buffer(3);
    var buf = new Buffer(SEGMENT_RECORD_LENGTH);

    if (file == null) {
        throw new Error('Invalid file');
    }

    // if ((dboptions & GEOIP_CHECK_CACHE) != 0) {
    //     mtime = databaseFile.lastModified();
    // }

    file.seek(file.length() - 3);

    for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);

        if (delim.readInt8(0) == -1 && delim.readInt8(1) == -1 && delim.readInt8(2) == -1) {
            databaseType = file.readByte();

            if (databaseType >= 106) {
                // Backward compatibility with databases from April 2003 and earlier
                databaseType -= 105;
            }

            // Determine the database type.
            if (databaseType == DatabaseInfo.REGION_EDITION_REV0) {
                databaseSegments = [ STATE_BEGIN_REV0 ];
                recordLength = STANDARD_RECORD_LENGTH;

            } else if (databaseType == DatabaseInfo.REGION_EDITION_REV1){
                databaseSegments = [ STATE_BEGIN_REV1 ];
                recordLength = STANDARD_RECORD_LENGTH;

            } else if (databaseType == DatabaseInfo.CITY_EDITION_REV0 ||
                       databaseType == DatabaseInfo.CITY_EDITION_REV1 ||
                       databaseType == DatabaseInfo.ORG_EDITION ||
                       databaseType == DatabaseInfo.ORG_EDITION_V6 ||
                       databaseType == DatabaseInfo.ISP_EDITION ||
                       databaseType == DatabaseInfo.ISP_EDITION_V6 ||
                       databaseType == DatabaseInfo.DOMAIN_EDITION ||
                       databaseType == DatabaseInfo.DOMAIN_EDITION_V6 ||
                       databaseType == DatabaseInfo.ASNUM_EDITION ||
                       databaseType == DatabaseInfo.ASNUM_EDITION_V6 ||
                       databaseType == DatabaseInfo.NETSPEED_EDITION_REV1 ||
                       databaseType == DatabaseInfo.NETSPEED_EDITION_REV1_V6 ||
                       databaseType == DatabaseInfo.CITY_EDITION_REV0_V6 ||
                       databaseType == DatabaseInfo.CITY_EDITION_REV1_V6
            ) {
                databaseSegments = [ 0 ];

                if (databaseType == DatabaseInfo.CITY_EDITION_REV0 ||
                    databaseType == DatabaseInfo.CITY_EDITION_REV1 ||
                    databaseType == DatabaseInfo.ASNUM_EDITION_V6 ||
                    databaseType == DatabaseInfo.NETSPEED_EDITION_REV1 ||
                    databaseType == DatabaseInfo.NETSPEED_EDITION_REV1_V6 ||
                    databaseType == DatabaseInfo.CITY_EDITION_REV0_V6 ||
                    databaseType == DatabaseInfo.CITY_EDITION_REV1_V6 ||
                    databaseType == DatabaseInfo.ASNUM_EDITION
                ) {
                    recordLength = STANDARD_RECORD_LENGTH;
                } else {
                    recordLength = ORG_RECORD_LENGTH;
                }

                file.readFully(buf);
                for (j = 0; j < SEGMENT_RECORD_LENGTH; j++) {
                    databaseSegments[0] += buf.readUInt8(j) << (j * 8);
                }
            }
            break;
        } else {
            file.seek(file.getFilePointer() - 4);
        }
    }

    if (databaseType == DatabaseInfo.COUNTRY_EDITION ||
        databaseType == DatabaseInfo.COUNTRY_EDITION_V6 ||
        databaseType == DatabaseInfo.PROXY_EDITION ||
        databaseType == DatabaseInfo.NETSPEED_EDITION
    ) {
        databaseSegments = [ COUNTRY_BEGIN ];
        recordLength = STANDARD_RECORD_LENGTH;
    }

    if ((dboptions & GEOIP_MEMORY_CACHE) == 1) {
        var l = file.length();
        dbbuffer = new Buffer(l);
        file.seek(0);
        file.readFully(dbbuffer,0,l);
        this.databaseInfo = _getDatabaseInfo();
        file.close();
    }

    if ((dboptions & GEOIP_INDEX_CACHE) != 0) {
        var l = databaseSegments[0] * recordLength * 2;
        index_cache = new Buffer(l);
        if (index_cache != null) {
            file.seek(0);
            file.readFully(index_cache,0,l);
        }
    } else {
        index_cache = null;
    }

    this.inited = true;
    this.path = path;

    return true;
}

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
        if (depth == 31 - 10)
            return null;

        if ((x0 * 2 * recordLength) + (2 * MAX_RECORD_LENGTH) < dbbuffer.length)
            _buildIndex(depth, x0);

        if ((x1 * 2 * recordLength) + (2 * MAX_RECORD_LENGTH)< dbbuffer.length)
            _buildIndex(depth, x1);
    }

    _cache = {};
    _buildIndex(31, 0);
};

module.exports.seekCountry = function(ipAddress) {

    _check_mtime();

    var buf = new Buffer(2 * MAX_RECORD_LENGTH);
    var databaseSegment = databaseSegments[0];

    if (_cache == null)
        _makeCache();

    var x0 = 0,
        x1 = 0,
        y = 0;

    var offset = 0;


    for (var depth = 31; depth >= 0; depth--) {

        var cache = _cache[offset];

        if (cache != undefined) {
            x0 = cache[0];
            x1 = cache[1];
        } else {

            if ((dboptions & GEOIP_MEMORY_CACHE) == 1) {
                //read from memory
                dbbuffer.copy(buf, 0, 2 * recordLength * offset, (2 * recordLength * offset) + (2 * MAX_RECORD_LENGTH));

            } else if ((dboptions & GEOIP_INDEX_CACHE) != 0) {
                //read from index cache
                index_cache.copy(buf, 0, 2 * recordLength * offset, (2 * recordLength * offset) + (2 * MAX_RECORD_LENGTH));

            } else {
                //read from disk

                // fs.readSync(fd, buffer, offset, length, position)

                try {
                    file.seek(2 * recordLength * offset);
                    file.readFully(buf);
                } catch (e) {
                    console.log("IO Exception");
                }
            }


            x0 = 0;
            x1 = 0;
            for (var j = 0; j<recordLength; j++) {
                y = buf[0*recordLength+j];
                // y = dbbuffer[(2 * recordLength * offset) + (0*recordLength+j)]
                x0 += (y << (j * 8));

                y = buf[1*recordLength+j];
                // y = dbbuffer[(2 * recordLength * offset) + (1*recordLength+j)]
                x1 += (y << (j * 8));
            }
        }


        if ((ipAddress & (1 << depth)) > 0) {
            if (x1 >= databaseSegment) {
                last_netmask = 32 - depth;
                return x1;
            }

            offset = x1;
        } else {
            if (x0 >= databaseSegment) {
                last_netmask = 32 - depth;
                return x0;
            }
            offset = x0;
        }
    }

    // shouldn't reach here
    console.log("Error seeking country while seeking, ip2long: " + ipAddress);
    return 0;
};

module.exports.getCountry = function(ipAddress) {
    if (typeof ipAddress == "string")
        ipAddress = this.ip2Long(ipAddress);

    var ret = this.seekCountry(ipAddress) - COUNTRY_BEGIN;

    if (ret == 0)
        return UNKNOWN_COUNTRY;

    return new Country(countryCode[ret], countryName[ret]);
};

module.exports.getLocation = function(ipnum) {

    if (typeof ipnum == "string")
        ipnum = this.ip2Long(ipnum);

    var record_pointer;
    var record_buf = new Buffer(FULL_RECORD_LENGTH);
    var record_buf_offset = 0;

    var record = new Location();

    var str_length = 0;
    var j, seek_country;
    var latitude = 0, longitude = 0;

    try {

        seek_country = this.seekCountry(ipnum);

        if (seek_country == databaseSegments[0])
            return null;

        record_pointer = seek_country + (2 * recordLength - 1) * databaseSegments[0];

        if ((dboptions & GEOIP_MEMORY_CACHE) == 1) {
            record_buf = new DynBuffer(dbbuffer, record_pointer, Math.min(dbbuffer.length - record_pointer, FULL_RECORD_LENGTH));
        } else {
            //read from disk
            file.seek(record_pointer);
            file.readFully(record_buf);
        }

        // get country
        record.countryCode = countryCode[record_buf.readUInt8(0)];
        record.countryName = countryName[record_buf.readUInt8(0)];
        record_buf_offset++;


        // get region
        while (record_buf.at(record_buf_offset + str_length) != 0x00)
            str_length++;

        if (str_length > 0)
            record.region = record_buf.toString('utf8', record_buf_offset, record_buf_offset + str_length);

        record_buf_offset += str_length + 1;
        str_length = 0;


        // get city
        while (record_buf.at(record_buf_offset + str_length) != 0x00)
            str_length++;

        if (str_length > 0)
            record.city = record_buf.toString('utf8', record_buf_offset, record_buf_offset + str_length);

        record_buf_offset += str_length + 1;
        str_length = 0;


        // get postal code
        while (record_buf.at(record_buf_offset + str_length) != 0x00)
            str_length++;

        if (str_length > 0)
            record.postalCode = record_buf.toString('utf8', record_buf_offset, record_buf_offset + str_length);

        record_buf_offset += str_length + 1;

        // get latitude
        latitude = (record_buf.readUInt8(record_buf_offset + 0) << (0 * 8))
                 + (record_buf.readUInt8(record_buf_offset + 1) << (1 * 8))
                 + (record_buf.readUInt8(record_buf_offset + 2) << (2 * 8));

        record.latitude = latitude/10000 - 180;
        record_buf_offset += 3;

        // get longitude
        longitude = (record_buf.readUInt8(record_buf_offset + 0) << (0 * 8))
                  + (record_buf.readUInt8(record_buf_offset + 1) << (1 * 8))
                  + (record_buf.readUInt8(record_buf_offset + 2) << (2 * 8));

        record.longitude = longitude/10000 - 180;

        record.dma_code = record.metro_code = 0;
        record.area_code = 0;

        if (databaseType == DatabaseInfo.CITY_EDITION_REV1) {
            // get DMA code
            var metroarea_combo = 0;
            if (record.countryCode == "US") {
                record_buf_offset += 3;

                for (j = 0; j < 3; j++)
                    metroarea_combo += record_buf.readUInt8(record_buf_offset + j) << (j * 8);

                record.metro_code = record.dma_code = metroarea_combo/1000;
                record.area_code = metroarea_combo % 1000;
            }
        }
    } catch (e) {
        console.log("IO Exception while seting up segments");
        console.log(e);
    }

    return record;
};

module.exports.getRegion = function(ipnum) {

    if (typeof ipnum == "string")
        ipnum = this.ip2Long(ipnum);

    var record = new Region();
    var seek_region = 0;

    if (databaseType == DatabaseInfo.REGION_EDITION_REV0) {
        seek_region = this.seekCountry(ipnum) - STATE_BEGIN_REV0;

        if (seek_region >= 1000) {
            record.countryCode = "US";
            record.countryName = "United States";
            record.region = String.fromCharCode(
                ((seek_region - 1000) / 26) + 65,
                ((seek_region - 1000) % 26) + 65
            );

        } else {
            record.countryCode = countryCode[seek_region];
            record.countryName = countryName[seek_region];
            record.region = "";
        }

    } else if (databaseType == DatabaseInfo.REGION_EDITION_REV1) {
        seek_region = seekCountry(ipnum) - STATE_BEGIN_REV1;

        if (seek_region < US_OFFSET) {
            record.countryCode = "";
            record.countryName = "";
            record.region = "";

        } else if (seek_region < CANADA_OFFSET) {
            record.countryCode = "US";
            record.countryName = "United States";
            record.region = String.fromCharCode(
                ((seek_region - US_OFFSET)/26) + 65,
                ((seek_region - US_OFFSET)%26) + 65
            );

        } else if (seek_region < WORLD_OFFSET) {
            record.countryCode = "CA";
            record.countryName = "Canada";
            record.region = String.fromCharCode(
                ((seek_region - CANADA_OFFSET)/26) + 65,
                ((seek_region - CANADA_OFFSET)%26) + 65
            );

        } else {
            record.countryCode = countryCode[(seek_region - WORLD_OFFSET) / FIPS_RANGE];
            record.countryName = countryName[(seek_region - WORLD_OFFSET) / FIPS_RANGE];
            record.region = "";
        }
    }
    return record;
};