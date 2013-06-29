
const DATABASE_INFO_MAX_SIZE   = 100;
const COUNTRY_BEGIN            = 16776960;
const STATE_BEGIN_REV0         = 16700000;
const STATE_BEGIN_REV1         = 16000000;
const STRUCTURE_INFO_MAX_SIZE  = 20;
const SEGMENT_RECORD_LENGTH    = 3;
const STANDARD_RECORD_LENGTH   = 3;
const ORG_RECORD_LENGTH        = 4;

// constDatabase types
const COUNTRY_EDITION          = 1;
const REGION_EDITION_REV0      = 7;
const CITY_EDITION_REV0        = 6;
const ORG_EDITION              = 5;
const ISP_EDITION              = 4;
const CITY_EDITION_REV1        = 2;
const REGION_EDITION_REV1      = 3;
const PROXY_EDITION            = 8;
const ASNUM_EDITION            = 9;
const NETSPEED_EDITION         = 10;
const DOMAIN_EDITION           = 11;
const COUNTRY_EDITION_V6       = 12;
const LOCATIONA_EDITION        = 13;
const ACCURACYRADIUS_EDITION   = 14;
const CITYCONFIDENCE_EDITION   = 15; /* unsupported */
const CITYCONFIDENCEDIST_EDITION = 16; /* unsupported */
const LARGE_COUNTRY_EDITION    = 17;
const LARGE_COUNTRY_EDITION_V6 = 18;
const CITYCONFIDENCEDIST_ISP_ORG_EDITION = 19; /* unsued, but gaps are not allowed */
const CCM_COUNTRY_EDITION      = 20; /* unsued, but gaps are not allowed */
const ASNUM_EDITION_V6         = 21;
const ISP_EDITION_V6           = 22;
const ORG_EDITION_V6           = 23;
const DOMAIN_EDITION_V6        = 24;
const LOCATIONA_EDITION_V6     = 25;
const REGISTRAR_EDITION        = 26;
const REGISTRAR_EDITION_V6     = 27;
const USERTYPE_EDITION         = 28;
const USERTYPE_EDITION_V6      = 29;
const CITY_EDITION_REV1_V6     = 30;
const CITY_EDITION_REV0_V6     = 31;
const NETSPEED_EDITION_REV1    = 32;
const NETSPEED_EDITION_REV1_V6 = 33;
const COUNTRYCONF_EDITION      = 34;
const CITYCONF_EDITION         = 35;
const REGIONCONF_EDITION       = 36;
const POSTALCONF_EDITION       = 37;
const ACCURACYRADIUS_EDITION_V6 = 38;

module.exports = function(file) {

    var i, j;
    var delim = new Buffer(3);
    var buf = new Buffer(SEGMENT_RECORD_LENGTH);

    this.type = COUNTRY_EDITION;
    this.segment = null;
    this.recordLength = 0;

    file.seek(file.length() - 3);

    for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);

        if (delim.readInt8(0) === -1 && delim.readInt8(1) === -1 && delim.readInt8(2) === -1) {
            this.type = file.readByte();

            if (this.type >= 106) {
                // Backward compatibility with databases from April 2003 and earlier
                this.type -= 105;
            }

            // Determine the database type.
            if (this.type === REGION_EDITION_REV0) {
                this.segment = STATE_BEGIN_REV0;
                this.recordLength = STANDARD_RECORD_LENGTH;

            } else if (this.type === REGION_EDITION_REV1){
                this.segment = STATE_BEGIN_REV1;
                this.recordLength = STANDARD_RECORD_LENGTH;

            } else if (this.type === CITY_EDITION_REV0 ||
                       this.type === CITY_EDITION_REV1 ||
                       this.type === ORG_EDITION ||
                       this.type === ORG_EDITION_V6 ||
                       this.type === ISP_EDITION ||
                       this.type === ISP_EDITION_V6 ||
                       this.type === DOMAIN_EDITION ||
                       this.type === DOMAIN_EDITION_V6 ||
                       this.type === ASNUM_EDITION ||
                       this.type === ASNUM_EDITION_V6 ||
                       this.type === NETSPEED_EDITION_REV1 ||
                       this.type === NETSPEED_EDITION_REV1_V6 ||
                       this.type === CITY_EDITION_REV0_V6 ||
                       this.type === CITY_EDITION_REV1_V6
            ) {
                this.segment = 0;

                if (this.type === CITY_EDITION_REV0 ||
                    this.type === CITY_EDITION_REV1 ||
                    this.type === ASNUM_EDITION_V6 ||
                    this.type === NETSPEED_EDITION_REV1 ||
                    this.type === NETSPEED_EDITION_REV1_V6 ||
                    this.type === CITY_EDITION_REV0_V6 ||
                    this.type === CITY_EDITION_REV1_V6 ||
                    this.type === ASNUM_EDITION
                ) {
                    this.recordLength = STANDARD_RECORD_LENGTH;
                } else {
                    this.recordLength = ORG_RECORD_LENGTH;
                }

                file.readFully(buf);
                for (j = 0; j < SEGMENT_RECORD_LENGTH; j++) {
                    this.segment += buf.readUInt8(j) << (j * 8);
                }
            }
            break;
        } else {
            file.seek(file.getFilePointer() - 4);
        }
    }

    if (this.type === COUNTRY_EDITION ||
        this.type === COUNTRY_EDITION_V6 ||
        this.type === PROXY_EDITION ||
        this.type === NETSPEED_EDITION
    ) {
        this.segment = COUNTRY_BEGIN;
        this.recordLength = STANDARD_RECORD_LENGTH;
    }


    var hasStructureInfo = false;
    delim = new Buffer(3);

    // Advance to part of file where database info is stored.
    file.seek(file.length() - 3);
    for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
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

    this.info = null;
    // Find the database info string.
    for (i = 0; i < DATABASE_INFO_MAX_SIZE; i++) {
        file.readFully(delim);
        if (delim[0] + delim[1] + delim[2] === 0) {
            this.info = new Buffer(i);
            file.readFully(this.info);
            this.info = this.info.toString();
        }
        file.seek(file.getFilePointer() - 4);
    }

    if (!this.info)
        throw new Error('Unable to find database info');

    this.isPremium = this.info.indexOf('FREE') < 0;

    this.date = null;
    for (var i = 0; i < this.info.length - 9; i++) {
        if (this.info.charCodeAt(i) === 0x20) {
            this.date = new Date(
                this.info.substring(i+1, i+9).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
            );
            break;
        }
    }
};
