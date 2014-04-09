var _data = require('./data/time_zone_data');

module.exports = function(country, region) {
  if (!country)
    return null;

  region = region || "";

  var _country = _data[country];

  if (_country !== undefined) {
     return _country[region];
  }

  return null;
};
