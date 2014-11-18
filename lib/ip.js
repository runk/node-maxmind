var assert = require('assert');


exports.v4ToLong = function(ip) {
  ip = ip.split('.', 4);

  var o0 = parseInt(ip[0]),
    o1 = parseInt(ip[1]),
    o2 = parseInt(ip[2]),
    o3 = parseInt(ip[3]);

  // assert(o0 > 0, 'Invalid IP address')
  // assert(o1 > 0, 'Invalid IP address')
  // assert(o2 > 0, 'Invalid IP address')
  // assert(o3 > 0, 'Invalid IP address')

  return (o0 * 0x1000000) + (o1 * 0x10000) + (o2 * 0x100) + o3;
};


exports.v6ToArray = function(ip) {
  // var a = Uint16Array(16);
  var a = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);

  if (ip.indexOf('::') === 0) {
    var at = ip.indexOf('::ffff') > -1 ? 7 : 2;
    ip = ip.substring(at).split('.', 4);
    for (var i = 0; i < ip.length; i++) {
      a[16 - (4 - i)] = +ip[i];
    };
    return a;
  }

  var parts = ip.split('::', 2),
    left = parts[0],
    right = parts[1];

  if (left) {
    var parsed = left.split(':');
    for (var i = 0; i < parsed.length; i++) {
      var chunk = parseInt(parsed[i], 16);
      a[i * 2] = chunk >> 8;
      a[i * 2 + 1] = chunk & 0xff;
    };
  }

  if (right) {
    var parsed = right.split(':');
    var pl = parsed.length;
    for (var i = 0; i < parsed.length; i++) {
      var chunk = parseInt(parsed[i], 16);
      a[15 - (pl - i * 2 + 1)] = chunk >> 8;
      a[15 - (pl - i * 2)] = chunk & 0xff;
    };
  }

  return a;
};


exports.v4toBinary = function(ip) {
  ip = ip.split('.', 4)

  var res = [];
  var o0 = (+ip[0]).toString(2)
  var o1 = (+ip[1]).toString(2)
  var o2 = (+ip[2]).toString(2)
  var o3 = (+ip[3]).toString(2)

  while (o0.length < 8) o0 = '0' + o0
  while (o1.length < 8) o1 = '0' + o1
  while (o2.length < 8) o2 = '0' + o2
  while (o3.length < 8) o3 = '0' + o3

  return o0 + o1 + o2 + o3;
};
