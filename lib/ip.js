
exports.v4ToLong = function(ip) {
  ip = ip.split('.', 4);

  ip[0] = parseInt(ip[0]);
  ip[1] = parseInt(ip[1]);
  ip[2] = parseInt(ip[2]);
  ip[3] = parseInt(ip[3]);

  return (ip[0] * 0x1000000) + (ip[1] * 0x10000) + (ip[2] * 0x100) + ip[3];
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


// TODO: is it fast enough?
exports.v4toBinary = function(ip) {
  ip = ip.split('.').map(Number);

  // convert the IP address to its big-endian binary representation
  ipa = new Buffer(ip).readUInt32BE(0).toString(2).split('').map(Number);
  while (ipa.length < 32)
    ipa.unshift(0)
  return ipa;
};
