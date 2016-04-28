'use strict';

var ipaddr = require('ip-address');

module.exports = IPParser;

var regexp = /^\d+\./;

function IPParser(ip) {

  if (regexp.test(ip))
    return IPParser.parseIPv4(ip);

  // if (ip.indexOf(':') !== -1) {
  return IPParser.parseIPv6(ip);
}

IPParser.parseIPv4 = function parseIPv4(ip) {
  ip = ip.split('.', 4);

  var o0 = parseInt(ip[0]),
    o1 = parseInt(ip[1]),
    o2 = parseInt(ip[2]),
    o3 = parseInt(ip[3]);

  return [o0, o1, o2, o3];
};

IPParser.parseIPv6 = function parseIPv6(ip) {
  var v6Address = new ipaddr.Address6(ip);
  if (!v6Address.isValid()) {
    throw new Error("Invalid IPv6 address " + ip);
  }

  return ipv6Buffer(v6Address.parsedAddress);
};


function ipv6Buffer(groups) {
  var arr = new Buffer(16);
  arr.fill(0);
  groups.forEach(function part(hex, i) {
    if (hex == "") return;
    if (hex.length < 4) {
      hex = repeat('0', 4 - hex.length) + hex;
    }
    arr.write(hex, i * 2, 'hex');
  });
  return arr;
}

function repeat(c, l) {
  var str = "", i = 0;
  while (i++ < l)str += c;
  return str;
}
