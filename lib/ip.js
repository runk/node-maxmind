
exports.v4ToLong = function(ip) {
  ip = ip.split('.', 4);

  ip[0] = parseInt(ip[0]);
  ip[1] = parseInt(ip[1]);
  ip[2] = parseInt(ip[2]);
  ip[3] = parseInt(ip[3]);

  return (ip[0] * 16777216) + (ip[1] * 65536) + (ip[2] * 256) + ip[3];
};


exports.v6ToBuffer = function(ip) {
  var ary = ip.replace(/(\w{2})(\w{2})/g, function(m, t, t1) { return t+':'+t1 }).split(':');

  return new Buffer(ary.map(function(i) {
    return parseInt(i, 16);
  }));
};
