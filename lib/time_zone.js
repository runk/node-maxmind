var _data = require('./data/time_zone_data');

module.exports = function(country, region) {
  if (!country)
    return null;

  var country = _data[country];
  return country ? country[region] || country[''] : null;
};
