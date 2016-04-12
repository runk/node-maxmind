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


Reader.prototype.findAddressInTree = function findAddressInTree(ipAddress) {
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
