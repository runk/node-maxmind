'use strict';

// TODO: Remove polyfill once BigInt gets supported by all node versions supported by this module.
//       After this, move contents of this file back to decoder.js, and kill big-integer dependency.
var bigInt = require('big-integer');

/* istanbul ignore file */
module.exports = (typeof BigInt === 'undefined') ?
  function polyfill(offset, size) {
    var buffer = Buffer.alloc(size);
    this.db.copy(buffer, 0, offset, offset + size);

    var integer = 0;

    var numberOfLongs = size / 4;
    for (var i = 0; i < numberOfLongs; i++) {
      integer = bigInt(integer).multiply(4294967296).add(buffer.readUInt32BE(i << 2, true));
    }

    return integer.toString();
  } :
  function native(offset, size) {
    var buffer = Buffer.alloc(size);
    this.db.copy(buffer, 0, offset, offset + size);

    var integer = BigInt(0); // eslint-disable-line no-undef

    var numberOfLongs = size / 4;
    for (var i = 0; i < numberOfLongs; i++) {
      integer = integer *
        BigInt(4294967296) + BigInt(buffer.readUInt32BE(i << 2, true)); // eslint-disable-line no-undef
    }

    return integer.toString();
  };
