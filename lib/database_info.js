
const DATABASE_INFO_MAX_SIZE   = 100;
const COUNTRY_BEGIN            = 16776960;
const STATE_BEGIN_REV0         = 16700000;
const STATE_BEGIN_REV1         = 16000000;
const STRUCTURE_INFO_MAX_SIZE  = 20;
const SEGMENT_RECORD_LENGTH    = 3;
const STANDARD_RECORD_LENGTH   = 3;
const ORG_RECORD_LENGTH        = 4;


module.exports = function(file) {

  var i, j;
  var delim = new Buffer(3);
  var buf = new Buffer(SEGMENT_RECORD_LENGTH);
  var self = module.exports;

  this.type = self.COUNTRY_EDITION;
  this.segment = null;
  this.recordLength = 0;

  file.seek(file.length() - 3);

  for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
    file.readFully(delim);

    if (delim[0] == 255 && delim[1] === 255 && delim[2] === 255) {
      this.type = file.readByte();

      if (this.type >= 106) {
        // Backward compatibility with databases from April 2003 and earlier
        this.type -= 105;
      }

      // Determine the database type.
      if (this.type === self.REGION_EDITION_REV0) {
        this.segment = STATE_BEGIN_REV0;
        this.recordLength = STANDARD_RECORD_LENGTH;

      } else if (this.type === self.REGION_EDITION_REV1){
        this.segment = STATE_BEGIN_REV1;
        this.recordLength = STANDARD_RECORD_LENGTH;

      } else if (this.type === self.CITY_EDITION_REV0 ||
             this.type === self.CITY_EDITION_REV1 ||
             this.type === self.ORG_EDITION ||
             this.type === self.ORG_EDITION_V6 ||
             this.type === self.ISP_EDITION ||
             this.type === self.ISP_EDITION_V6 ||
             this.type === self.DOMAIN_EDITION ||
             this.type === self.DOMAIN_EDITION_V6 ||
             this.type === self.ASNUM_EDITION ||
             this.type === self.ASNUM_EDITION_V6 ||
             this.type === self.NETSPEED_EDITION_REV1 ||
             this.type === self.NETSPEED_EDITION_REV1_V6 ||
             this.type === self.CITY_EDITION_REV0_V6 ||
             this.type === self.CITY_EDITION_REV1_V6
      ) {
        this.segment = 0;

        if (this.type === self.CITY_EDITION_REV0 ||
          this.type === self.CITY_EDITION_REV1 ||
          this.type === self.ASNUM_EDITION_V6 ||
          this.type === self.NETSPEED_EDITION_REV1 ||
          this.type === self.NETSPEED_EDITION_REV1_V6 ||
          this.type === self.CITY_EDITION_REV0_V6 ||
          this.type === self.CITY_EDITION_REV1_V6 ||
          this.type === self.ASNUM_EDITION
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

  if (this.type === self.COUNTRY_EDITION ||
    this.type === self.COUNTRY_EDITION_V6 ||
    this.type === self.PROXY_EDITION ||
    this.type === self.NETSPEED_EDITION
  ) {
    this.segment = COUNTRY_BEGIN;
    this.recordLength = STANDARD_RECORD_LENGTH;
  }


  var hasStructureInfo = false;
  delim = new Buffer(3);

  // TODO: refactor it
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
      if (i === 0) {
        this.info = 'Unknown';
      } else {
        this.info = new Buffer(i);
        file.readFully(this.info);
        this.info = this.info.toString();
        break;
      }
    }
    file.seek(file.getFilePointer() - 4);
  }

  if (!this.info)
    throw new Error('Unable to find database info');

  this.isPremium = this.info.indexOf('FREE') < 0 && this.info.indexOf('LITE') < 0;

  this.date = null;
  for (i = 0; i < this.info.length - 9; i++) {
    if (this.info.charCodeAt(i) === 0x20) {
      this.date = new Date(
        this.info.substring(i+1, i+9).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      );
      break;
    }
  }
};

// constDatabase types
module.exports.COUNTRY_EDITION          = 1;
module.exports.REGION_EDITION_REV0      = 7;
module.exports.CITY_EDITION_REV0        = 6;
module.exports.ORG_EDITION              = 5;
module.exports.ISP_EDITION              = 4;
module.exports.CITY_EDITION_REV1        = 2;
module.exports.REGION_EDITION_REV1      = 3;
module.exports.PROXY_EDITION            = 8;
module.exports.ASNUM_EDITION            = 9;
module.exports.NETSPEED_EDITION         = 10;
module.exports.DOMAIN_EDITION           = 11;
module.exports.COUNTRY_EDITION_V6       = 12;
module.exports.LOCATIONA_EDITION        = 13;
module.exports.ACCURACYRADIUS_EDITION   = 14;
module.exports.CITYCONFIDENCE_EDITION   = 15; /* unsupported */
module.exports.CITYCONFIDENCEDIST_EDITION = 16; /* unsupported */
module.exports.LARGE_COUNTRY_EDITION    = 17;
module.exports.LARGE_COUNTRY_EDITION_V6 = 18;
module.exports.CITYCONFIDENCEDIST_ISP_ORG_EDITION = 19; /* unsued, but gaps are not allowed */
module.exports.CCM_COUNTRY_EDITION      = 20; /* unsued, but gaps are not allowed */
module.exports.ASNUM_EDITION_V6         = 21;
module.exports.ISP_EDITION_V6           = 22;
module.exports.ORG_EDITION_V6           = 23;
module.exports.DOMAIN_EDITION_V6        = 24;
module.exports.LOCATIONA_EDITION_V6     = 25;
module.exports.REGISTRAR_EDITION        = 26;
module.exports.REGISTRAR_EDITION_V6     = 27;
module.exports.USERTYPE_EDITION         = 28;
module.exports.USERTYPE_EDITION_V6      = 29;
module.exports.CITY_EDITION_REV1_V6     = 30;
module.exports.CITY_EDITION_REV0_V6     = 31;
module.exports.NETSPEED_EDITION_REV1    = 32;
module.exports.NETSPEED_EDITION_REV1_V6 = 33;
module.exports.COUNTRYCONF_EDITION      = 34;
module.exports.CITYCONF_EDITION         = 35;
module.exports.REGIONCONF_EDITION       = 36;
module.exports.POSTALCONF_EDITION       = 37;
module.exports.ACCURACYRADIUS_EDITION_V6 = 38;
