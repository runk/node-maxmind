'use strict';

var Reader = require('./lib/reader');
var ip = require('./lib/ip');

exports.open = function(database, opts) {
  return new Reader(database, opts);
};

exports.init = function() {
  throw new Error(
    'Maxmind v1 module has changed API.\n\
    Upgrade instructions can be found here: \
    https://github.com/runk/node-maxmind/wiki/Migration-guide\n\
    If you want to use legacy libary then explicitly install maxmind@0.6'
  );
};

exports.validate = ip.validate;
