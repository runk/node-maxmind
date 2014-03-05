
exports.v4ToLong = function(ip) {
  ip = ip.split('.', 4);

  ip[0] = parseInt(ip[0]);
  ip[1] = parseInt(ip[1]);
  ip[2] = parseInt(ip[2]);
  ip[3] = parseInt(ip[3]);

  return (ip[0] * 16777216) + (ip[1] * 65536) + (ip[2] * 256) + ip[3];
};


exports.v6ToArray = function(ip) {
  var a = Array.apply(null, new Array(16)).map(Number.prototype.valueOf, 0);

  if (ip.indexOf('::') === 0) {
    var at = ip.indexOf('::ffff') > -1 ? 7 : 2;
    ip = ip.substring(at).split('.', 4);
    for (var i = 0; i < ip.length; i++) {
      a[16 - (4 - i)] = +ip[i];
    };
    return a;
  }

  var parts = ip.split('::', 2);
  var left = parts[0],
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

  // TODO: use Uint16Array instead?
  return a
};
