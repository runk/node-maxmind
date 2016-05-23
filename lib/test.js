'use strict';

var assert = require('assert');
var Decoder = require('./decoder');

var METADATA_START_MARKER = new Buffer('ABCDEF4D61784D696E642E636F6D', 'hex');

module.exports = Metadata;

function Metadata(fileStream) {
  var offset = this.findStart(fileStream);
  var decoder = new Decoder(fileStream, offset);
  var metadata = decoder.decode(offset).value;

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


Metadata.prototype.findStart = function(fileStream) {
  var found = 0,
    mlen = METADATA_START_MARKER.length - 1,
    fsize = fileStream.length - 1;
  while (found <= mlen && fsize-- > 0) {
    found += (fileStream[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
  }
  return fsize + found;
};
