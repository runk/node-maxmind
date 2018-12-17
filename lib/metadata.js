'use strict';

var assert = require('assert');
var Decoder = require('./decoder');
var utils = require('./utils');

var METADATA_START_MARKER = Buffer.from('ABCDEF4D61784D696E642E636F6D', 'hex');


module.exports = Metadata;

function Metadata(db) {
  var offset = this.findStart(db);
  var decoder = new Decoder(db, offset);
  var metadata = decoder.decode(offset).value;

  if (!metadata) {
    throw new Error(this.isLegacyFormat(db) ? utils.legacyErrorMessage : 'Cannot parse binary database');
  }

  this.binaryFormatMajorVersion = metadata.binary_format_major_version;
  this.binaryFormatMinorVersion = metadata.binary_format_minor_version;
  this.buildEpoch = new Date(metadata.build_epoch * 1000);
  this.databaseType = metadata.database_type;
  this.languages = metadata.languages;
  this.description = metadata.description;
  this.ipVersion = metadata.ip_version;
  this.nodeCount = metadata.node_count;

  this.recordSize = metadata.record_size;
  assert([24, 28, 32].indexOf(this.recordSize) > -1, 'Unsupported record size');

  this.nodeByteSize = this.recordSize / 4;
  this.searchTreeSize = this.nodeCount * this.nodeByteSize;

  // Depth depends on the IP version, it's 32 for IPv4 and 128 for IPv6.
  this.treeDepth = Math.pow(2, this.ipVersion + 1);
}


Metadata.prototype.findStart = function(db) {
  var found = 0,
    mlen = METADATA_START_MARKER.length - 1,
    fsize = db.length - 1;

  while (found <= mlen && fsize-- > 0) {
    found += (db[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
  }
  return fsize + found;
};


Metadata.prototype.isLegacyFormat = function(db) {
  var structureInfoMaxSize = 20;

  for (var i = 0; i < structureInfoMaxSize; i++) {
    var delim = db.slice(db.length - 3 - i, db.length - i);

    // Look for [0xff, 0xff, 0xff] metadata delimeter
    if (delim[0] === 255 && delim[1] === 255 && delim[2] === 255) {
      return true;
    }
  }

  return false;
};
