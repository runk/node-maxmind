'use strict';

var assert = require('assert');
var fs = require('fs');
var Reader = require('./lib/reader');
var ip = require('./lib/ip');
var utils = require('./lib/utils');

exports.open = function(filepath, opts, cb) {
  if (!cb) cb = opts;
  assert.equal(typeof cb, 'function', 'Callback function must be provided. \
    If you want to open library synchronously, use maxmind.openSync function.');

  fs.readFile(filepath, function(err, database) {
    if (err) cb(err);
    else cb(null, new Reader(database, opts));
  });
};

exports.openSync = function(filepath, opts) {
  return new Reader(fs.readFileSync(filepath), opts);
};

exports.init = function() {
  throw new Error(utils.legacyErrorMessage);
};

exports.validate = ip.validate;
