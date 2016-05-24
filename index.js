'use strict';

var Reader = require('./lib/reader');
var ip = require('./lib/ip');
var utils = require('./lib/utils');

exports.open = function(database, opts) {
  return new Reader(database, opts);
};

exports.init = function() {
  throw new Error(utils.legacyErrorMessage);
};

exports.validate = ip.validate;
