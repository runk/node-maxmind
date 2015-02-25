var DynBuffer = require('../dyn_buffer'),
  Location = require('../location'),
  DatabaseInfo = require('../database_info');

var regionNameData = require('../data/region_name_data'),
  countriesData = require('../data/country_data'),
  continentsData = require('../data/continents');

const FULL_RECORD_LENGTH = 60;

module.exports = function(db, cseek) {
  var recordBuf;
  var recordBufOffset = 0;

  var record = new Location();

  var pointer = 0;
  var j;
  var latitude = 0, longitude = 0;

  if (cseek === db.segment)
    return null;

  var recordPointer = cseek + (2 * db.recordLength - 1) * db.segment;

  if (db.opts.memoryCache) {
    recordBuf = new DynBuffer(db.dbbuffer, recordPointer,
      Math.min(db.dbbuffer.length - recordPointer, FULL_RECORD_LENGTH));
  } else {
    //read from disk
    recordBuf = new DynBuffer(new Buffer(FULL_RECORD_LENGTH), 0, FULL_RECORD_LENGTH);
    db.file.seek(recordPointer);
    db.file.readFully(recordBuf.source);
  }

  // get country
  record.countryCode = countriesData.codes[recordBuf.readUInt8(0)];
  record.countryName = countriesData.names[recordBuf.readUInt8(0)];
  // get continent
  record.continentCode = continentsData[record.countryCode] || '--';

  recordBufOffset++;

  // get region
  var byte;
  var region = '';
  while (true) {
    byte = recordBuf.at(recordBufOffset + pointer);
    if (byte === 0) break;
    region += String.fromCharCode(byte);
    pointer++;
  }

  record.region = region || null;
  // while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
  //   pointer++;

  // if (pointer > 0)
  //   record.region = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

  record.regionName = module.exports.getRegionName(record.countryCode, record.region);

  recordBufOffset += pointer + 1;
  pointer = 0;

  // get city
  var city = '';
  while (true) {
    byte = recordBuf.at(recordBufOffset + pointer);
    if (byte === 0) break;
    city += String.fromCharCode(byte);
    pointer++;
  }

  record.city = city || null;

  // while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
  //   pointer++;

  // if (pointer > 0)
  //   record.city = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

  recordBufOffset += pointer + 1;
  pointer = 0;

  // get postal code
  var po = '';
  while (true) {
    byte = recordBuf.at(recordBufOffset + pointer);
    if (byte === 0) break;
    po += String.fromCharCode(byte);
    pointer++;
  }
  record.postalCode = po || null;

  // while (recordBuf.at(recordBufOffset + pointer) !== 0x00)
  //   pointer++;

  // if (pointer > 0)
  //   record.postalCode = recordBuf.toString('binary', recordBufOffset, recordBufOffset + pointer);

  recordBufOffset += pointer + 1;

  // get latitude
  latitude = (recordBuf.readUInt8(recordBufOffset + 0) << (0 * 8)) +
    (recordBuf.readUInt8(recordBufOffset + 1) << (1 * 8)) +
    (recordBuf.readUInt8(recordBufOffset + 2) << (2 * 8));

  record.latitude = latitude / 10000 - 180;
  recordBufOffset += 3;

  // get longitude
  longitude = (recordBuf.readUInt8(recordBufOffset + 0) << (0 * 8)) +
    (recordBuf.readUInt8(recordBufOffset + 1) << (1 * 8)) +
    (recordBuf.readUInt8(recordBufOffset + 2) << (2 * 8));

  record.longitude = longitude / 10000 - 180;

  record.dmaCode = record.metroCode = 0;
  record.areaCode = 0;

  if (db.type === DatabaseInfo.CITY_EDITION_REV1) {
    // get DMA code
    var metroareaCombo = 0;
    if (record.countryCode === 'US') {
      recordBufOffset += 3;

      metroareaCombo += (recordBuf.readUInt8(recordBufOffset + 0) << (0 * 8)) +
        (recordBuf.readUInt8(recordBufOffset + 1) << (1 * 8)) +
        (recordBuf.readUInt8(recordBufOffset + 2) << (2 * 8));

      record.metroCode = record.dmaCode = parseInt(metroareaCombo / 1000);
      record.areaCode = metroareaCombo % 1000;
    }
  }

  return record;
};


module.exports.getRegionName = function(countryCode, regionCode) {
  var regionCode2;

  if (!regionCode)
    return null;

  // not quite sure that those calculations really required,
  // since we use the same in the generator script
  var fst = regionCode.charCodeAt(0),
    scd = regionCode.charCodeAt(1);

  if ((fst >= 48 && fst < 48 + 10) && (scd >= 48 && scd < 48 + 10)) {
    // only numbers, that shorten the large switch statements
    regionCode2 = (fst - 48) * 10 + scd - 48;
  } else if ((
    (fst >= 65 && fst < 65 + 26) || (fst >= 48 && fst < 48 + 10)
  ) && (
    (scd >= 65 && scd < 65 + 26) || (scd >= 48 && scd < 48 + 10)
  )) {
    regionCode2 = (fst - 48) * (65 + 26 - 48) + scd - 48 + 100;
  }

  if (!regionCode2 || !regionNameData[countryCode])
    return null;

  return regionNameData[countryCode][regionCode2];
};
