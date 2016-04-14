var DATA_SECTION_SEPARATOR_SIZE = 16,
  METADATA_START_MARKER = new Buffer('ABCDEF4D61784D696E642E636F6D', 'hex'),
  fs = require('fs'),
  Metadata = require('./Metadata.js'),
  Decoder = require('./Decoder.js'),
  IPParser = require('./IPParser.js');

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


Reader.prototype.findAddressInTree2 = function findAddressInTree(ipAddress) {
  var bit, tempBit, record,
    rawAddress = IPParser(ipAddress),
    countRaw = rawAddress.length,
    isIp4AddressInIp6Db = (countRaw === 4 && this.metadata.getIpVersion() === 6),
    ipStartBit = isIp4AddressInIp6Db ? 96 : 0,
    nodeNum = 0,
    i = 0;

  const nodeCount = this.metadata.getNodeCount();

  // Depth is:
  //   32 for ipv4
  //   128 for ipv6 and mixed ipv4 + ipv6
  var depth = Math.pow(2, this.metadata.getIpVersion() + 1);

  for (i; i < depth; i++) {
    bit = 0;

    if (i >= ipStartBit) {
      tempBit = 0xFF & rawAddress[parseInt((i - ipStartBit) / 8, 10)];
      bit = 1 & (tempBit >> 7 - (i % 8));
    }

    record = this.readNode(nodeNum, bit);

    if (record === nodeCount) {
      return 0;
    }

    if (record > nodeCount) {
      return record;
    }

    nodeNum = record;
  }

  return null;
};

Reader.prototype.findAddressInTree = function findAddressInTree(ipAddress) {
  var rawAddress = IPParser(ipAddress);
  const nodeCount = this.metadata.getNodeCount();

  // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
  // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
  const ipStartBit = (rawAddress.length === 4 && this.metadata.getIpVersion() === 6) ? 128 - 32 : 0;

  // Depth depends on the IP version, it's 32 for IPv4 and 128 for IPv6.
  var maxDepth = Math.pow(2, this.metadata.getIpVersion() + 1);

  // Binary search tree consists of certain (`nodeCount`) number of nodes. Tree
  // depth depends on the ip version, it's 32 for IPv4 and 128 for IPv6. Each
  // tree node has the same fixed length and usually 6-8 bytes. It consists
  // of two records, left and right:
  // |         node        |
  // | 0x000000 | 0x000000 |
  var bit, byte, nBit;
  var nodeNum = 0;
  var pointer;

  for (var i = 0; i < maxDepth; i++) {
    // When storing IPv4 addresses in an IPv6 tree, they are stored as-is, so they
    // occupy the first 32-bits of the address space (from 0 to 2**32 - 1).
    // Which means they're padded with zeros.
    if (i >= ipStartBit) {
      nBit = i - ipStartBit;
      byte = rawAddress[Math.floor(nBit / 8)];
      bit = (byte >> Math.abs((nBit % 8) - 7)) & 1;
    } else {
      bit = 0;
    }

    pointer = this.readNode(nodeNum, bit);

    // Record value can point to one of three things:
    // 1. Point to the value of `nodeCount`, which means IP address is unknown
    if (pointer === nodeCount) {
      return 0;
    }

    // 2. Data section address with relevant information
    if (pointer > nodeCount) {
      return pointer;
    }

    // 3. Another node in the tree
    nodeNum = pointer;
  }

  return null;
};

Reader.prototype.readNode = function readNode(nodeNumber, index) {
  var bytes, middle,
    buffer = new Buffer(4),
    baseOffset = nodeNumber * this.metadata.getNodeByteSize()
    ;

  buffer.fill(0);
  switch (this.metadata.getRecordSize()) {
    case 24:
      bytes = baseOffset + index * 3;
      this.fileHandle.copy(buffer, 1, bytes, bytes + 3);
      return buffer.readUInt32BE(0, true);
    case 28:
      middle = this.fileHandle.readUInt8(baseOffset + 3, true);
      middle = (index === 0) ? (0xF0 & middle) >> 4 : 0x0F & middle;
      bytes = baseOffset + index * 4;
      this.fileHandle.copy(buffer, 1, bytes, bytes + 3);
      buffer.writeUInt8(middle, 0);
      return buffer.readUInt32BE(0, true);
    case 32:
      return this.fileHandle.readUInt32BE(baseOffset + index * 4, true);
    default:
      throw new Error("MaxmindDBReader: Unknown Recordsize in DB");
  }
};

Reader.prototype.resolveDataPointerSync = function resolveDataPointerSync(pointer) {
  var resolved = pointer - this.metadata.getNodeCount() + this.metadata.getSearchTreeSize();

  return this.decoder.decodeSync(resolved)[0];
};


Reader.prototype.getMetadata = function metadata() {
  return this.metadata;
};
