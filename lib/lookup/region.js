var Region = require('../region'),
  DatabaseInfo = require('../database_info');

var countriesData = require('../data/country_data');
var continentsData = require('../data/continents');

const STATE_BEGIN_REV0 = 16700000;
const STATE_BEGIN_REV1 = 16000000;
const US_OFFSET = 1;
const CANADA_OFFSET = 677;
const WORLD_OFFSET = 1353;
const FIPS_RANGE = 360;


module.exports = function(db, cseek) {
  var record = new Region(),
    seekRegion = 0;

  if (db.type === DatabaseInfo.REGION_EDITION_REV0) {
    seekRegion = cseek - STATE_BEGIN_REV0;

    if (seekRegion >= 1000) {
      record.countryCode = 'US';
      record.countryName = 'United States';
      record.continentCode = 'NA';
      record.region = String.fromCharCode(
        ((seekRegion - 1000) / 26) + 65,
        ((seekRegion - 1000) % 26) + 65
      );

    } else {
      record.countryCode = countriesData.codes[seekRegion];
      record.countryName = countriesData.names[seekRegion];
      record.continentCode = continentsData[record.countryCode] || '--';
      record.region = '';
    }

  } else if (db.type === DatabaseInfo.REGION_EDITION_REV1) {
    seekRegion = cseek - STATE_BEGIN_REV1;

    if (seekRegion < US_OFFSET) {
      record.countryCode = '';
      record.countryName = '';
      record.continentCode = '';
      record.region = '';

    } else if (seekRegion < CANADA_OFFSET) {
      record.countryCode = 'US';
      record.countryName = 'United States';
      record.continentCode = 'NA';
      record.region = String.fromCharCode(
        ((seekRegion - US_OFFSET)/26) + 65,
        ((seekRegion - US_OFFSET)%26) + 65
      );

    } else if (seekRegion < WORLD_OFFSET) {
      record.countryCode = 'CA';
      record.countryName = 'Canada';
      record.continentCode = 'NA';
      record.region = String.fromCharCode(
        ((seekRegion - CANADA_OFFSET)/26) + 65,
        ((seekRegion - CANADA_OFFSET)%26) + 65
      );

    } else {
      record.countryCode = countriesData.codes[(seekRegion - WORLD_OFFSET) / FIPS_RANGE];
      record.countryName = countriesData.names[(seekRegion - WORLD_OFFSET) / FIPS_RANGE];
      record.continentCode = continentsData[record.countryCode] || '--';
      record.region = '';
    }
  }
  return record;
};
