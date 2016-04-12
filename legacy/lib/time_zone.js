var _data = require('./data/time_zone_data');

module.exports = function(country, region) {
  if (!country)
    return null;

  var result = _data[country];
  return result ? result[region] || result[''] : null;
};
