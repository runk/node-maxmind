var net = require('net');
var Reader = require('./lib/reader');

exports.open = function(database) {
  return new Reader(database);
};

exports.init = function() {
  throw new Error(
    'Maxmind v1 module has changed API.\n\
    Upgrade instructions can be found here: https://github.com/runk/node-maxmind/wiki/Migration-guide\
    If you want to use legacy libary then explicitly install maxmind@0.6'
  );
};

exports.validate = function(ip) {
  var version = net.isIP(ip);
  switch (version) {
    case 4:
      return net.isIPv4(ip);
    case 6:
      return net.isIPv6(ip);
    case 0:
      return false;
    default:
      throw new Error('net.isIP call returned unexpected value: "' + version + '"');
  }
};
