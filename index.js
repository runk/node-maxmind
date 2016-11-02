'use strict';

var assert = require('assert');
var fs = require('fs');
var Reader = require('./lib/reader');
var ip = require('./lib/ip');
var utils = require('./lib/utils');

exports.Reader = Reader;

exports.open = function(filepath, opts, cb) {
  if (!cb) cb = opts;
  assert.equal(typeof cb, 'function', 'Callback function must be provided. \
    If you want to open library synchronously, use maxmind.openSync function.');

  fs.readFile(filepath, function(err, database) {
    if (err) cb(err);
    else {
      var reader = new Reader(database, opts);
      if (opts && !!opts.watchForUpdates) {
        fs.watch(filepath, function(event, filename) {
          fs.readFile(filename, function(err, database) {
            if (err) throw err;
            reader.load(database);
          });
        });
      }
      cb(null, reader);
    }
  });
};

exports.openSync = function(filepath, opts) {
  var reader = new Reader(fs.readFileSync(filepath), opts);
  if (opts && !!opts.watchForUpdates) {
    fs.watch(filepath, function() {
      reader.load(fs.readFileSync(filepath));
    });
  }

  return reader;
};

exports.init = function() {
  throw new Error(utils.legacyErrorMessage);
};

exports.validate = ip.validate;
