var DATA_SECTION_SEPARATOR_SIZE = 16,
  METADATA_START_MARKER = new Buffer('ABCDEF4D61784D696E642E636F6D', 'hex'),
  fs = require('fs'),
  Metadata = require('./Metadata.js'),
  Decoder = require('./Decoder.js'),
  IPParser = require('./IPParser.js');

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


Reader.openSync = function openSync(database) {
  var reader = new Reader();
  var start, metadataDecoder, metadataArray;

  reader.fileHandle = fs.readFileSync(database);

  start = reader.findMetadataStart(reader.fileHandle);
  metadataDecoder = new Decoder(reader.fileHandle, 0);
  metadataArray = metadataDecoder.decodeSync(start);
  reader.metadata = new Metadata(metadataArray[0]);
  reader.decoder = new Decoder(reader.fileHandle, reader.metadata.getSearchTreeSize() + DATA_SECTION_SEPARATOR_SIZE);
  return reader;
};

Reader.prototype.findMetadataStart = function findMetadataStart(file) {
  var found = 0,
    mlen = METADATA_START_MARKER.length - 1,
    fsize = file.length - 1
    ;
  while (found <= mlen && fsize-- > 0) {
    found += (file[fsize] === METADATA_START_MARKER[mlen - found]) ? 1 : -found;
  }
  return fsize + found;
};

Reader.prototype.getSync = function getSync(ipAddress) {
  var pointer = this.findAddressInTree(ipAddress);
  return (pointer === 0) ? null : this.resolveDataPointerSync(pointer);
};

var bitAt = function(rawAddress, idx) {
  // 8 bits per octet in the buffer (>>3 is slightly faster than Math.floor(idx/8))
  var bufIdx = idx >> 3;

  // Offset within the octet (basicallg equivalent to 8  - (idx % 8))
  var bitIdx = 7 ^ (idx & 7);

  // Shift the offset rightwards by bitIdx bits and & it to grab the bit
  return (rawAddress[bufIdx] >>> bitIdx) & 1;
};

Reader.prototype.findAddressInTree = function(ipAddress) {
  var rawAddress = IPParser(ipAddress);
  const nodeCount = this.metadata.nodeCount;

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  const ipStartBit = (rawAddress.length === 4 && this.metadata.ipVersion === 6) ? 128 - 32 : 0;

  // Depth depends on the IP version, it's 32 for IPv4 and 128 for IPv6.
  var maxDepth = Math.pow(2, this.metadata.ipVersion + 1);

  // Binary search tree consists of certain (`nodeCount`) number of nodes. Tree
  // depth depends on the ip version, it's 32 for IPv4 and 128 for IPv6. Each
  // tree node has the same fixed length and usually 6-8 bytes. It consists
  // of two records, left and right:
  // |         node        |
  // | 0x000000 | 0x000000 |
  var bit, byte, nBit;
  var nodeNum = ipStartBit;
  var pointer;

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  // Which means they're padded with zeros.
  for (var i = ipStartBit; i < maxDepth; i++) {
    bit = bitAt(rawAddress, i - ipStartBit)

    // if (bit === 0)
    //   pointer = this.readNodeLeft(nodeNum, bit);
    // else
    //   pointer = this.readNodeRight(nodeNum, bit);

    pointer = this.readNode(nodeNum, bit)

    // Record value can point to one of three things:
    // 1. Another node in the tree (most common case)
    if (pointer < nodeCount) {
      nodeNum = pointer;

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


Reader.prototype.readNodeLeft = function(nodeNumber) {
  var offset = nodeNumber * this.metadata.nodeByteSize;

  return concat4(
    this.fileHandle[offset + 3] >> 4,
    this.fileHandle[offset],
    this.fileHandle[offset + 1],
    this.fileHandle[offset + 2]
  );
}

Reader.prototype.readNodeRight = function(nodeNumber) {
  var offset = nodeNumber * this.metadata.nodeByteSize;

  return concat4(
    this.fileHandle[offset + 3] & 0x0f,
    this.fileHandle[offset + 3 + 1],
    this.fileHandle[offset + 3 + 2],
    this.fileHandle[offset + 3 + 3]
  );
}


Reader.prototype.readNode = function readNode(nodeNumber, bit) {
  var offset = nodeNumber * this.metadata.nodeByteSize;

  switch (this.metadata.recordSize) {
    case 24:
      var pointer = offset + (bit * 3);
      return concat3(
        this.fileHandle[pointer],
        this.fileHandle[pointer + 1],
        this.fileHandle[pointer + 2]
      );
    case 28:
      if (bit === 0) {
        return this.readNodeLeft(nodeNumber);
      } else {
        return this.readNodeRight(nodeNumber);
      }
    case 32:
      return this.fileHandle.readUInt32BE(offset + bit * 4, true);
    default:
      throw new Error('Unknown Recordsize in DB');
  }
};

Reader.prototype.resolveDataPointerSync = function resolveDataPointerSync(pointer) {
  // In order to determine where in the file this offset really points to, we also
  // need to know where the data section starts. This can be calculated by
  // determining the size of the search tree in bytes and then adding an additional
  // 16 bytes for the data section separator.
  // So the final formula to determine the offset in the file is:
  //     $offset_in_file = ( $record_value - $node_count )
  //                       + $search_tree_size_in_bytes

  var resolved = pointer - this.metadata.getNodeCount() + this.metadata.getSearchTreeSize();

  return this.decoder.decodeSync(resolved)[0];
};


Reader.prototype.getMetadata = function metadata() {
  return this.metadata;
};
