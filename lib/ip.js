'use strict';

var net = require('net');


var parseIPv4 = function(ip) {
  ip = ip.split('.', 4);

  var o0 = parseInt(ip[0]),
    o1 = parseInt(ip[1]),
    o2 = parseInt(ip[2]),
    o3 = parseInt(ip[3]);

  return [o0, o1, o2, o3];
};


var parseIPv6 = function(ip) {
  var addr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var i;
  var parsed;
  var chunk;

  var hex = function(v) {
    v = parseInt(v, 10).toString(16);
    return (v.length == 2) ? v : '0' + v;
  };

  // ipv4 e.g. `::ffff:64.17.254.216`
  if (ip.indexOf('.') > -1) {
    ip = ip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, function(match, a, b, c, d) {
      return hex(a) + hex(b) + ':' + hex(c) + hex(d);
    });
  }

  var parts = ip.split('::', 2),
    left = parts[0],
    right = parts[1];

  if (left) {
    parsed = left.split(':');
    for (i = 0; i < parsed.length; i++) {
      chunk = parseInt(parsed[i], 16);
      addr[i * 2] = chunk >> 8;
      addr[i * 2 + 1] = chunk & 0xff;
    }
  }


  if (right) {
    parsed = right.split(':');
    var offset = 16 - (parsed.length * 2); // 2 bytes per chunk
    for (i = 0; i < parsed.length; i++) {
      chunk = parseInt(parsed[i], 16);
      addr[offset + (i * 2)] = chunk >> 8;
      addr[offset + (i * 2 + 1)] = chunk & 0xff;
    }
  }

  return addr;
};


exports.parse = function(ip) {
  return (ip.indexOf(':') === -1) ? parseIPv4(ip) : parseIPv6(ip);
};


exports.bitAt = function(rawAddress, idx) {
  // 8 bits per octet in the buffer (>>3 is slightly faster than Math.floor(idx/8))
  var bufIdx = idx >> 3;

  // Offset within the octet (basicallg equivalent to 8  - (idx % 8))
  var bitIdx = 7 ^ (idx & 7);

  // Shift the offset rightwards by bitIdx bits and & it to grab the bit
  return (rawAddress[bufIdx] >>> bitIdx) & 1;
};


exports.validate = function(ip) {
  var version = net.isIP(ip);
  return version === 4 || version === 6;
};
