var bigInt = require('big-integer');

function concat2(a, b) {
  return (a << 8) | b;
}

function concat3(a, b, c) {
  return (a << 16) | (b << 8) | c;
}

function concat4(a, b, c, d) {
  return (a << 24) | (b << 16) | (c << 8) | d;
}

module.exports = Decoder;

function Decoder(fileStream, pointerBase) {
  this.fileStream = fileStream;
  this.pointerBase = pointerBase || 0;
  this.types = [
    'extended',         //  0
    'pointer',          //  1
    'utf8_string',      //  2
    'double',           //  3
    'bytes',            //  4
    'uint16',           //  5
    'uint32',           //  6
    'map',              //  7
    'int32',            //  8
    'uint64',           //  9
    'uint128',          // 10
    'array',            // 11
    'container',        // 12
    'end_marker',       // 13
    'boolean',          // 14
    'float'             // 15
  ];
  this.pointerValueOffset = [0, 0, 2048, 526336, 0];
}


Decoder.prototype.decodeSync = function decodeSync(offset) {
  var tmp,
    ctrlByte = this.fileStream[offset++],
    type = this.types[ctrlByte >> 5]
    ;

  if (type === 'pointer') {
    tmp = this.decodePointer(ctrlByte, offset);
    return [this.decodeSync(tmp[0])[0], tmp[1]];
  }

  if (type === 'extended') {
    tmp = this.fileStream[offset] + 7;

    if (tmp < 8) {
      throw new Error('MaxmindDBReader: Invalid Extended Type at offset:' + offset);
    }

    type = this.types[tmp];
    offset++;
  }

  tmp = this.sizeFromCtrlByte(ctrlByte, offset);

  return this.decodeByTypeSync(type, tmp[1], tmp[0]);
};

Decoder.prototype.decodeByTypeSync = function decodeByTypeSync(type, offset, size) {
  var newOffset = offset + size;

  switch (type) {
    case 'map':
      return this.decodeMapSync(size, offset);
    case 'array':
      return this.decodeArraySync(size, offset);
    case 'boolean':
      return [this.decodeBoolean(size), offset];
    case 'utf8_string':
      return [this.decodeString(offset, size), newOffset];
    case 'double':
      return [this.decodeDouble(offset, size), newOffset];
    case 'float':
      return [this.decodeFloat(offset, size), newOffset];
    case 'bytes':
      var bytes = this.read(offset, size);
      return [bytes, newOffset];
    case 'uint16':
      return [this.decodeUint16(offset, size), newOffset];
    case 'uint32':
      return [this.decodeUint32(offset, size), newOffset];
    case 'int32':
      var bytes = this.read(offset, size);
      return [this.decodeInt32(bytes), newOffset];

    // rare
    case 'uint64':
      var bytes = this.read(offset, size);
      return [this.decodeUint64(bytes), newOffset];
    case 'uint128':
      var bytes = this.read(offset, size);
      return [this.decodeUint128(bytes), newOffset];

    default:
      throw new Error("MaxmindDBReader: Unknown or unexpected type: " + type + ' at offset:' + offset);
  }
};

Decoder.prototype.read = function read(offset, numberOfBytes) {
  var buf;

  if (numberOfBytes === 0) {
    return new Buffer(0);
  }

  if (numberOfBytes === 1) {
    return new Buffer([this.fileStream[offset]]);
  }

  buf = new Buffer(numberOfBytes);
  buf.fill(0);

  this.fileStream.copy(buf, 0, offset, offset + numberOfBytes);

  return buf;
};

Decoder.prototype.sizeFromCtrlByte = function sizeFromCtrlByte(ctrlByte, offset) {
  var size = ctrlByte & 0x1f,
    bytesToRead = size < 29 ? 0 : size - 28,
    bytes = this.read(offset, bytesToRead),
    decoded = this.decodeUniInt(bytes)
    ;

  if (size === 29) {
    size = 29 + decoded;
  } else if (size === 30) {
    size = 285 + decoded;
  } else if (size > 30) {
    size = (decoded & (0x0FFFFFFF >> (32 - (8 * bytesToRead)))) + 65821;
  }

  return [size, offset + bytesToRead];
};

Decoder.prototype.decodePointer = function decodePointer(ctrlByte, offset) {
  var packed, pointer,
    pointerSize = ((ctrlByte >> 3) & 0x3) + 1,
    buffer = this.read(offset, pointerSize)
    ;

  offset += pointerSize;

  packed = (pointerSize === 4) ? buffer : Buffer.concat([new Buffer([ctrlByte & 0x7]), buffer], buffer.length + 1);

  pointer = this.decodeUniInt(packed) + this.pointerBase + this.pointerValueOffset[pointerSize];

  return [pointer, offset];
};

Decoder.prototype.decodeArraySync = function decodeArraySync(size, offset) {
  var tmp,
    i = 0,
    array = []
    ;

  for (i; i < size; i++) {
    tmp = this.decodeSync(offset);
    offset = tmp[1];
    array.push(tmp[0]);
  }

  return [array, offset];
};

Decoder.prototype.decodeBoolean = function decodeBoolean(size) {
  return (size !== 0);
};

Decoder.prototype.decodeDouble = function decodeDouble(offset, size) {
  return this.fileStream.readDoubleBE(offset, true);
};

Decoder.prototype.decodeFloat = function decodeFloat(offset, size) {
  return this.fileStream.readFloatBE(offset, true);
};


Decoder.prototype.decodeMapSync = function decodeMapSync(size, offset) {
  var tmp, key,
    map = {},
    i = 0
    ;

  for (i; i < size; i++) {
    tmp = this.decodeSync(offset);
    key = tmp[0].toString();
    tmp = this.decodeSync(tmp[1]);
    offset = tmp[1];
    map[key] = tmp[0];
  }

  return [map, offset];
};

Decoder.prototype.decodeUint16 = function(offset, size) {
  if (size == 0) return 0;
  if (size == 1) return this.fileStream[offset];
  if (size == 2) return this.fileStream.readUInt16BE(offset, true);
};

Decoder.prototype.decodeInt32 = function decodeInt32(bytes) {
  return bytes.readInt32BE(0, true);
};

Decoder.prototype.decodeUint32 = function decodeUint32(offset, size) {
  if (size == 0) return 0;
  if (size == 1) return this.fileStream[offset];
  if (size == 2) return this.fileStream.readUInt16BE(offset, true);
  if (size == 3) return concat3(this.fileStream[offset], this.fileStream[offset + 1], this.fileStream[offset + 2]);
  if (size == 4) return this.fileStream.readUInt32BE(offset, true);
};

Decoder.prototype.decodeUniInt = function(bytes) {
  var l = bytes.length;
  if (l == 0) return 0;
  if (l == 1) return bytes[0];
  if (l == 2) return concat2(bytes[0], bytes[1]);
  if (l == 3) return concat3(bytes[0], bytes[1], bytes[2]);
  if (l == 4) return concat4(bytes[0], bytes[1], bytes[2], bytes[3]);
}

Decoder.prototype.decodeUint64 = function decodeUint64(bytes) {
  return this.decodeBigUint(bytes, 8);
};

Decoder.prototype.decodeUint128 = function decodeUint128(bytes) {
  return this.decodeBigUint(bytes, 16);
};

Decoder.prototype.decodeBigUint = function decodeBigUint(bytes, size) {
  var buffer,
    i = 0,
    integer = 0,
    numberOfLongs = size / 4
    ;

  buffer = new Buffer(size);
  buffer.fill(0);
  bytes.copy(buffer, size - bytes.length);

  for (i; i < numberOfLongs; i++) {
    var tmp = integer * 4294967296
    if (tmp >= Number.MAX_SAFE_INTEGER)
      console.log("!!!!!!", tmp)
    integer = bigInt(integer).multiply(4294967296).add(buffer.readUInt32BE(i << 2, true));
    if (integer >= Number.MAX_SAFE_INTEGER)
      console.log("!!!!!!", integer)
  }

  return integer.toString();
};

Decoder.prototype.decodeString = function decodeString(offset, size) {
  return this.fileStream.toString('utf8', offset, offset + size);
};
