'use strict';

var Metadata = require('./metadata');
var Decoder = require('./decoder');
var ipUtil = require('./ip');
var utils = require('./utils');

var DATA_SECTION_SEPARATOR_SIZE = 16;


module.exports = Reader;

function Reader(db, opts) {
  opts = opts || {};
  this.load(db, opts);
}

Reader.prototype.load = function(db, opts) {
  this.db = db;

  this.metadata = new Metadata(this.db);
  this.decoder = new Decoder(
    this.db,
    this.metadata.searchTreeSize + DATA_SECTION_SEPARATOR_SIZE,
    opts
  );

  this.setupNodeReaderFn(this.metadata.recordSize);
};

Reader.prototype.setupNodeReaderFn = function(recordSize) {
  switch (recordSize) {
    case 24:
      this.readNodeLeft = readNodeLeft24;
      this.readNodeRight = readNodeRight24;
      break;
    case 28:
      this.readNodeLeft = readNodeLeft28;
      this.readNodeRight = readNodeRight28;
      break;
    case 32:
      this.readNodeLeft = readNodeLeft32;
      this.readNodeRight = readNodeRight32;
      break;
  }
};


Reader.prototype.get = function(ipAddress) {
  var pointer = this.findAddressInTree(ipAddress);
  return pointer ? this.resolveDataPointer(pointer) : null;
};


Reader.prototype.findAddressInTree = function(ipAddress) {
  var rawAddress = ipUtil.parse(ipAddress);
  var nodeCount = this.metadata.nodeCount;

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  // Which means they're padded with zeros.
  var ipStartBit = (this.metadata.ipVersion === 6 && rawAddress.length === 4) ? 128 - 32 : 0;

  // Binary search tree consists of certain (`nodeCount`) number of nodes. Tree
  // depth depends on the ip version, it's 32 for IPv4 and 128 for IPv6. Each
  // tree node has the same fixed length and usually 6-8 bytes. It consists
  // of two records, left and right:
  // |         node        |
  // | 0x000000 | 0x000000 |
  var bit;
  var nodeNumber = ipStartBit;
  var pointer, offset;

  for (var i = ipStartBit; i < this.metadata.treeDepth; i++) {
    bit = ipUtil.bitAt(rawAddress, i - ipStartBit);
    offset = nodeNumber * this.metadata.nodeByteSize;

    pointer = bit ?
      this.readNodeRight(offset) :
      this.readNodeLeft(offset);

    // Record value can point to one of three things:
    // 1. Another node in the tree (most common case)
    if (pointer < nodeCount) {
      nodeNumber = pointer;

    // 2. Data section address with relevant information (less common case)
    } else if (pointer > nodeCount) {
      return pointer;

    // 3. Point to the value of `nodeCount`, which means IP address is unknown
    } else {
      return null;
    }
  }
};


var readNodeRight24 = function(offset) {
  return utils.concat3(
    this.db[offset + 3],
    this.db[offset + 4],
    this.db[offset + 5]
  );
};

var readNodeLeft24 = function(offset) {
  return utils.concat3(
    this.db[offset],
    this.db[offset + 1],
    this.db[offset + 2]
  );
};


var readNodeLeft28 = function(offset) {
  return utils.concat4(
    this.db[offset + 3] >> 4,
    this.db[offset],
    this.db[offset + 1],
    this.db[offset + 2]
  );
};

var readNodeRight28 = function(offset) {
  return utils.concat4(
    this.db[offset + 3] & 0x0f,
    this.db[offset + 4],
    this.db[offset + 5],
    this.db[offset + 6]
  );
};

var readNodeLeft32 = function(offset) {
  return this.db.readUInt32BE(offset, true);
};

var readNodeRight32 = function(offset) {
  return this.db.readUInt32BE(offset + 4, true);
};


Reader.prototype.resolveDataPointer = function(pointer) {
  // In order to determine where in the file this offset really points to, we also
  // need to know where the data section starts. This can be calculated by
  // determining the size of the search tree in bytes and then adding an additional
  // 16 bytes for the data section separator.
  // So the final formula to determine the offset in the file is:
  //     $offset_in_file = ( $record_value - $node_count )
  //                       + $search_tree_size_in_bytes
  var resolved = pointer - this.metadata.nodeCount + this.metadata.searchTreeSize;
  return this.decoder.decodeFast(resolved).value;
};
