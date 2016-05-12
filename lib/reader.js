var fs = require('fs');
var LRU = require('lru-cache');
var Metadata = require('./metadata');
var Decoder = require('./decoder');
var ipUtil = require('./ip');

const DATA_SECTION_SEPARATOR_SIZE = 16;
const METADATA_START_MARKER = new Buffer('ABCDEF4D61784D696E642E636F6D', 'hex');

function concat2(a, b) {
  return (a << 8) | b;
}

function concat3(a, b, c) {
  return (a << 16) | (b << 8) | c;
}

function concat4(a, b, c, d) {
  return (a << 24) | (b << 16) | (c << 8) | d;
}

module.exports = Reader;

function Reader() {}


Reader.open = function(database) {
  var reader = new Reader();

  reader.cache = LRU({
    max: 50000,
    maxAge: 60 * 60 * 1000, // 1hr
  });

  var start, metadataDecoder, metadataArray;

  reader.fileHandle = fs.readFileSync(database);

  start = reader.findMetadataStart(reader.fileHandle);
  metadataDecoder = new Decoder(reader.fileHandle, 0);
  metadataArray = metadataDecoder.decode(start);
  reader.metadata = new Metadata(metadataArray[0]);
  reader.decoder = new Decoder(reader.fileHandle, reader.metadata.searchTreeSize + DATA_SECTION_SEPARATOR_SIZE);

  switch (reader.metadata.recordSize) {
    case 24:
      reader.readNodeLeft = readNodeLeft24;
      reader.readNodeRight = readNodeRight24;
      break;
    case 28:
      reader.readNodeLeft = readNodeLeft28;
      reader.readNodeRight = readNodeRight28;
      break;
    case 32:
      reader.readNodeLeft = readNodeLeft32;
      reader.readNodeRight = readNodeRight32;
      break;
    default:
      throw new Error('Unknown Recordsize in DB');
  }

  return reader;
};

Reader.prototype.findMetadataStart = function(file) {
  var found = 0,
    mlen = METADATA_START_MARKER.length - 1,
    fsize = file.length - 1
    ;
  while (found <= mlen && fsize-- > 0) {
    found += (file[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
  }
  return fsize + found;
};

Reader.prototype.get = function(ipAddress) {
  var pointer = this.findAddressInTree(ipAddress);
  return pointer === 0 ? null : this.resolveDataPointer(pointer);
};


Reader.prototype.findAddressInTree = function(ipAddress) {
  var rawAddress = ipUtil.parse(ipAddress);
  const nodeCount = this.metadata.nodeCount;

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  const ipStartBit = (this.metadata.ipVersion === 6 && rawAddress.length === 4) ? 128 - 32 : 0;

  // Binary search tree consists of certain (`nodeCount`) number of nodes. Tree
  // depth depends on the ip version, it's 32 for IPv4 and 128 for IPv6. Each
  // tree node has the same fixed length and usually 6-8 bytes. It consists
  // of two records, left and right:
  // |         node        |
  // | 0x000000 | 0x000000 |
  var bit;
  var nodeNumber = ipStartBit;
  var pointer, offset;

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  // Which means they're padded with zeros.
  for (var i = ipStartBit; i < this.metadata.treeDepth; i++) {
    bit = ipUtil.bitAt(rawAddress, i - ipStartBit)
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
      return 0;
    }
  }

  return null;
};


var readNodeRight24 = function(offset) {
  return concat3(
    this.fileHandle[offset + 3],
    this.fileHandle[offset + 4],
    this.fileHandle[offset + 5]
  );
}

var readNodeLeft24 = function(offset) {
  return concat3(
    this.fileHandle[offset],
    this.fileHandle[offset + 1],
    this.fileHandle[offset + 2]
  );
}


var readNodeLeft28 = function(offset) {
  return concat4(
    this.fileHandle[offset + 3] >> 4,
    this.fileHandle[offset],
    this.fileHandle[offset + 1],
    this.fileHandle[offset + 2]
  );
}

var readNodeRight28 = function(offset) {
  return concat4(
    this.fileHandle[offset + 3] & 0x0f,
    this.fileHandle[offset + 4],
    this.fileHandle[offset + 5],
    this.fileHandle[offset + 6]
  );
}

var readNodeLeft32 = function(offset) {
  return this.fileHandle.readUInt32BE(offset, true);
}

var readNodeRight32 = function(offset) {
  return this.fileHandle.readUInt32BE(offset + 4, true);
}


Reader.prototype.resolveDataPointer = function(pointer) {
  // In order to determine where in the file this offset really points to, we also
  // need to know where the data section starts. This can be calculated by
  // determining the size of the search tree in bytes and then adding an additional
  // 16 bytes for the data section separator.
  // So the final formula to determine the offset in the file is:
  //     $offset_in_file = ( $record_value - $node_count )
  //                       + $search_tree_size_in_bytes

  if (this.cache.has(pointer)) {
    return this.cache.get(pointer);
  }

  var resolved = pointer - this.metadata.nodeCount + this.metadata.searchTreeSize;

  var result = this.decoder.decode(resolved)[0];
  this.cache.set(pointer, result);
  return result;
};