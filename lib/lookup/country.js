var countries = require('../data/country_data');

const COUNTRY_BEGIN = 16776960;
const UNKNOWN_COUNTRY = new Country("--", "N/A");


function Country(code, name) {
  this.code = code;
  this.name = name;
}


module.exports = function(db, cseek) {
  var ret = cseek - COUNTRY_BEGIN;

  if (ret === 0)
    return UNKNOWN_COUNTRY;

  return new Country(countries.codes[ret], countries.names[ret]);
};
