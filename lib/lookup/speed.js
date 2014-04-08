const speeds = [
  'Unknown', 'Dial-up', 'Cable/DSL', 'Corporate'
];

const COUNTRY_BEGIN = 16776960;

module.exports = function(db, cseek) {
  var ret = cseek - COUNTRY_BEGIN;

  return speeds[ret];
};
