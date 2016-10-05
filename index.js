'use strict';

var assert = require('assert');
var fs = require('fs');
var Reader = require('./lib/reader');
var ip = require('./lib/ip');
var utils = require('./lib/utils');
var index = require('./index');

exports.Reader = Reader;

exports.open = function(filepath, opts, cb) {
  if (!cb) cb = opts;
  assert.equal(typeof cb, 'function', 'Callback function must be provided. \
    If you want to open library synchronously, use maxmind.openSync function.');

  fs.readFile(filepath, function(err, database) {
    if (err) cb(err);
    else cb(null, index.load(database, opts));
  });
};

exports.openSync = function(filepath, opts) {
  return index.load(fs.readFileSync(filepath), opts);
};

exports.load = function(database, opts) {
  return new Reader(database, opts);
};

exports.init = function() {
  throw new Error(utils.legacyErrorMessage);
};

exports.validate = ip.validate;
