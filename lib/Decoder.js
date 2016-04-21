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
}

var types = [
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
var pointerValueOffset = [0, 2048, 526336, 0]


Decoder.prototype.decodeSync = function decodeSync(offset) {
  var tmp,
    ctrlByte = this.fileStream[offset++],
    type = types[ctrlByte >> 5]
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

    type = types[tmp];
    offset++;
  }

  tmp = this.sizeFromCtrlByte(ctrlByte, offset);

  return this.decodeByTypeSync(type, tmp[1], tmp[0]);
};

Decoder.prototype.decodeByTypeSync = function decodeByTypeSync(type, offset, size) {
  var newOffset = offset + size;

  // todo: sort
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
      return [this.decodeInt32(offset, size), newOffset];
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

Decoder.prototype.sizeFromCtrlByte = function(ctrlByte, offset) {
  // The first three bits of the control byte tell you what type the field is. If
  // these bits are all 0, then this is an "extended" type, which means that the
  // *next* byte contains the actual type. Otherwise, the first three bits will
  // contain a number from 1 to 7, the actual type for the field.
  var type = ctrlByte >> 3;

  // The next five bits in the control byte tell you how long the data field's
  // payload is, except for maps and pointers. Maps and pointers use this size
  // information a bit differently.

  var size = ctrlByte & 0x1f;

  // If the five bits are smaller than 29, then those bits are the payload size in
  // bytes. For example:
  //   01000010          UTF-8 string - 2 bytes long
  //   01011100          UTF-8 string - 28 bytes long
  //   11000001          unsigned 32-bit int - 1 byte long
  //   00000011 00000011 unsigned 128-bit int - 3 bytes long
  if (size < 29)
    return [size, offset];

  // If the value is 29, then the size is 29 + *the next byte after the type
  // specifying bytes as an unsigned integer*.
  if (size === 29)
    return [29 + this.fileStream[offset], offset + 1];

  // If the value is 30, then the size is 285 + *the next two bytes after the type
  // specifying bytes as a single unsigned integer*.
  if (size === 30)
    return [285 + this.fileStream.readUInt16BE(offset, false), offset + 2];

  // If the value is 31, then the size is 65,821 + *the next three bytes after the
  // type specifying bytes as a single unsigned integer*.
  if (size === 31)
    return [
      65821 + concat3(this.fileStream[offset], this.fileStream[offset + 1], this.fileStream[offset + 2]),
      offset + 3
    ];
};

Decoder.prototype.decodePointer = function decodePointer(ctrlByte, offset) {
  // Pointers use the last five bits in the control byte to calculate the pointer value.

  // To calculate the pointer value, we start by subdiving the five bits into two
  // groups. The first two bits indicate the size, and the next three bits are part
  // of the value, so we end up with a control byte breaking down like this:
  // 001SSVVV.
  var pointerSize = ((ctrlByte >> 3) & 3);

  var pointer = this.pointerBase + pointerValueOffset[pointerSize];

  // The size can be 0, 1, 2, or 3.

  // If the size is 0, the pointer is built by appending the next byte to the last
  // three bits to produce an 11-bit value.
  if (pointerSize === 0) {
    packed = concat2(ctrlByte & 7, this.fileStream[offset]);

  // If the size is 1, the pointer is built by appending the next two bytes to the
  // last three bits to produce a 19-bit value + 2048.
  } else if (pointerSize === 1) {
    packed = concat3(ctrlByte & 7, this.fileStream[offset], this.fileStream[offset + 1]);

  // If the size is 2, the pointer is built by appending the next three bytes to the
  // last three bits to produce a 27-bit value + 526336.
  } else if (pointerSize === 2) {
    packed = concat4(ctrlByte & 7, this.fileStream[offset], this.fileStream[offset + 1], this.fileStream[offset + 2]);

  // Finally, if the size is 3, the pointer's value is contained in the next four
  // bytes as a 32-bit value. In this case, the last three bits of the control byte
  // are ignored.
  } else if (pointerSize === 3) {
    packed = this.fileStream.readUInt32BE(offset, true);
  }

  offset += pointerSize + 1;
  return [pointer + packed, offset];
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

Decoder.prototype.decodeBoolean = function(size) {
  return (size !== 0);
};

Decoder.prototype.decodeDouble = function(offset, size) {
  return this.fileStream.readDoubleBE(offset, true);
};

Decoder.prototype.decodeFloat = function(offset, size) {
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

Decoder.prototype.decodeInt32 = function decodeInt32(offset, size) {
  if (size == 0) return 0;
  return this.fileStream.readInt32BE(offset, true);
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
