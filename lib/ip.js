'use strict';

var net = require('net');
var ipaddr = require('ip-address');


var parseIPv4 = function(ip) {
  ip = ip.split('.', 4);

  var o0 = parseInt(ip[0]),
    o1 = parseInt(ip[1]),
    o2 = parseInt(ip[2]),
    o3 = parseInt(ip[3]);

  return [o0, o1, o2, o3];
};


var parseIPv6 = function(ip) {
  var v6Address = new ipaddr.Address6(ip);
  if (!v6Address.isValid()) {
    throw new Error('Invalid IPv6 address ' + ip);
  }

  return ipv6Buffer(v6Address.parsedAddress);
};


// TODO: rewrite this mess
function ipv6Buffer(parsedAddress) {
  var arr = new Buffer(16);
  arr.fill(0);
  parsedAddress.forEach(function(hex, i) {
    if (hex.length < 4) {
      hex = repeat('0', 4 - hex.length) + hex;
    }
    arr.write(hex, i * 2, 'hex');
  });
  return arr;
}


function repeat(c, l) {
  var str = '', i = 0;
  while (i++ < l) str += c;
  return str;
}


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
  switch (version) {
    case 4:
      return net.isIPv4(ip);
    case 6:
      return net.isIPv6(ip);
    default:
      return false;
  }
};
