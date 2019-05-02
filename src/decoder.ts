import assert from 'assert';
// @ts-ignore
import lru from 'tiny-lru';
import { OpenOpts } from '.';
import * as primitives from './decoder/primitives';
import utils from './utils';

assert(
  typeof BigInt !== 'undefined',
  'Apparently you are using old version of node. Please upgrade to node 0.10 or above.'
);

enum Type {
  Extended = 0,
  Pointer,
  String,
  Double,
  Bytes,
  Uint16,
  Uint32,
  Map,
  Int32,
  Uint64,
  Uint128,
  Array,
  Container,
  End_marker,
  Boolean,
  Float,
}

const pointerValueOffset = [0, 2048, 526336, 0];

interface Cursor {
  value: any;
  offset: number;
}

interface Cache {
  get(key: string | number): any;
  set(key: string | number, value: any): any;
}

const cursor = (value: any, offset: number): Cursor => ({ value, offset });

export default class Decoder {
  public telemetry: Record<string, any> = {};
  private db: Buffer;
  private baseOffset: number;
  private cache: Cache;

  constructor(db: Buffer, baseOffset: number = 0, opts?: OpenOpts) {
    assert((this.db = db), 'File stream is required');
    this.baseOffset = baseOffset;

    this.cache = lru(
      opts && opts.cache && opts.cache.max ? opts.cache.max : 6000
    );
  }

  public decode(offset: number): any {
    let tmp: any;
    const ctrlByte = this.db[offset++];
    let type: Type = ctrlByte >> 5;

    if (type === Type.Pointer) {
      tmp = this.decodePointer(ctrlByte, offset);
      return cursor(this.decodeFast(tmp.value).value, tmp.offset);
    }

    if (type === Type.Extended) {
      tmp = this.db[offset] + 7;
      if (tmp < 8) {
        throw new Error(
          'Invalid Extended Type at offset ' + offset + ' val ' + tmp
        );
      }

      type = tmp;
      offset++;
    }

    const size = this.sizeFromCtrlByte(ctrlByte, offset);
    return this.decodeByType(type, size.offset, size.value);
  }

  public decodeFast(offset: number) {
    const cached = this.cache.get(offset);
    if (cached) {
      return cached;
    }

    const result = this.decode(offset);
    this.cache.set(offset, result);
    return result;
  }

  public decodeByType(type: Type, offset: number, size: number): Cursor {
    const newOffset = offset + size;

    // ipv4 types occurrence stats:
    // 3618591 x utf8_string
    // 448163 x map
    // 175085 x uint32
    // 83040 x double
    // 24745 x array
    // 3 x uint16
    // 1 x uint64
    // 14 x boolean
    switch (type) {
      case Type.String:
        return cursor(
          primitives.decodeString(this.db, offset, size),
          newOffset
        );
      case Type.Map:
        return this.decodeMap(size, offset);
      case Type.Uint32:
        return cursor(primitives.decodeUint(this.db, offset, size), newOffset);
      case Type.Double:
        return cursor(primitives.decodeDouble(this.db, offset), newOffset);
      case Type.Array:
        return this.decodeArray(size, offset);
      case Type.Boolean:
        return cursor(primitives.decodeBoolean(size), offset);
      case Type.Float:
        return cursor(primitives.decodeFloat(this.db, offset), newOffset);
      case Type.Bytes:
        return cursor(primitives.decodeBytes(this.db, offset, size), newOffset);
      case Type.Uint16:
        return cursor(primitives.decodeUint(this.db, offset, size), newOffset);
      case Type.Int32:
        return cursor(primitives.decodeInt32(this.db, offset, size), newOffset);
      case Type.Uint64:
        return cursor(primitives.decodeUint(this.db, offset, size), newOffset);
      case Type.Uint128:
        return cursor(primitives.decodeUint(this.db, offset, size), newOffset);
    }

    throw new Error('Unknown type ' + type + ' at offset ' + offset);
  }

  public sizeFromCtrlByte(ctrlByte: number, offset: number): Cursor {
    // The first three bits of the control byte tell you what type the field is. If
    // these bits are all 0, then this is an "extended" type, which means that the
    // *next* byte contains the actual type. Otherwise, the first three bits will
    // contain a number from 1 to 7, the actual type for the field.
    // var type = ctrlByte >> 3;

    // The next five bits in the control byte tell you how long the data field's
    // payload is, except for maps and pointers. Maps and pointers use this size
    // information a bit differently.``

    const size = ctrlByte & 0x1f;

    // If the five bits are smaller than 29, then those bits are the payload size in
    // bytes. For example:
    //   01000010          UTF-8 string - 2 bytes long
    //   01011100          UTF-8 string - 28 bytes long
    //   11000001          unsigned 32-bit int - 1 byte long
    //   00000011 00000011 unsigned 128-bit int - 3 bytes long
    if (size < 29) {
      return cursor(size, offset);
    }

    // If the value is 29, then the size is 29 + *the next byte after the type
    // specifying bytes as an unsigned integer*.
    if (size === 29) {
      return cursor(29 + this.db[offset], offset + 1);
    }

    // If the value is 30, then the size is 285 + *the next two bytes after the type
    // specifying bytes as a single unsigned integer*.
    if (size === 30) {
      return cursor(285 + this.db.readUInt16BE(offset, false), offset + 2);
    }

    // At this point `size` is always 31.
    // If the value is 31, then the size is 65,821 + *the next three bytes after the
    // type specifying bytes as a single unsigned integer*.
    return cursor(
      65821 +
        utils.concat3(
          this.db[offset],
          this.db[offset + 1],
          this.db[offset + 2]
        ),
      offset + 3
    );
  }

  public decodePointer(ctrlByte: number, offset: number): Cursor {
    // Pointers use the last five bits in the control byte to calculate the pointer value.

    // To calculate the pointer value, we start by subdiving the five bits into two
    // groups. The first two bits indicate the size, and the next three bits are part
    // of the value, so we end up with a control byte breaking down like this:
    // 001SSVVV.
    const pointerSize = (ctrlByte >> 3) & 3;

    const pointer = this.baseOffset + pointerValueOffset[pointerSize];
    let packed = 0;

    // The size can be 0, 1, 2, or 3.

    // If the size is 0, the pointer is built by appending the next byte to the last
    // three bits to produce an 11-bit value.
    if (pointerSize === 0) {
      packed = utils.concat2(ctrlByte & 7, this.db[offset]);

      // If the size is 1, the pointer is built by appending the next two bytes to the
      // last three bits to produce a 19-bit value + 2048.
    } else if (pointerSize === 1) {
      packed = utils.concat3(
        ctrlByte & 7,
        this.db[offset],
        this.db[offset + 1]
      );

      // If the size is 2, the pointer is built by appending the next three bytes to the
      // last three bits to produce a 27-bit value + 526336.
    } else if (pointerSize === 2) {
      packed = utils.concat4(
        ctrlByte & 7,
        this.db[offset],
        this.db[offset + 1],
        this.db[offset + 2]
      );

      // At next point `size` is always 3.
      // Finally, if the size is 3, the pointer's value is contained in the next four
      // bytes as a 32-bit value. In this case, the last three bits of the control byte
      // are ignored.
    } else {
      packed = this.db.readUInt32BE(offset, true);
    }

    offset += pointerSize + 1;
    return cursor(pointer + packed, offset);
  }

  public decodeArray(size: number, offset: number): Cursor {
    let tmp;

    if (size === 1) {
      tmp = this.decode(offset);
      offset = tmp.offset;
      return cursor([tmp.value], offset);
    }

    const array = [];

    for (let i = 0; i < size; i++) {
      tmp = this.decode(offset);
      offset = tmp.offset;
      array.push(tmp.value);
    }

    return cursor(array, offset);
  }

  public decodeMapItem(map: Record<string, any>, offset: number) {
    let tmp;
    // NB! key can be either Pointer or String type
    tmp = this.decode(offset);
    const key = tmp.value;
    tmp = this.decode(tmp.offset);
    map[key] = tmp.value;
    return tmp.offset;
  }

  public decodeMap(size: number, offset: number) {
    const map: Record<string, any> = {};

    const r = 3;
    let iterations = size % r;

    // Decreasing number of iterations
    while (iterations) {
      offset = this.decodeMapItem(map, offset);
      iterations--;
    }

    iterations = Math.floor(size / r);

    while (iterations) {
      offset = this.decodeMapItem(map, offset);
      offset = this.decodeMapItem(map, offset);
      offset = this.decodeMapItem(map, offset);
      iterations--;
    }

    return cursor(map, offset);
  }
}
