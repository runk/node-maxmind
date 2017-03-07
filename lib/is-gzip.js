'use strict';

module.exports = function(buf) {
  if (!buf || buf.length < 3) {
    return false;
  }

  return buf[0] === 0x1f && buf[1] === 0x8b && buf[2] === 0x08;
};
