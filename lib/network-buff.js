
var http = require('http');

// @see lib/buff.js

function NetworkBuff(path, cb) {
  var self = this;
  http.get(path, function(res) {
    var data;
    res.on('data', function(chunk) {
      if(!data) data = chunk;
      else data += chunk;
    }).on('end', function() {
       var buf = new Buffer(data);
       self.ba = buf;
       self.meta = {size: buf.length};
       cb(true);
    });
  });
}
NetworkBuff.prototype.ba = null;
NetworkBuff.prototype.meta = null;
NetworkBuff.prototype.pointer = 0;
NetworkBuff.prototype.closed = false;
NetworkBuff.prototype.length = function() {
  return this.meta.size;
};
NetworkBuff.prototype.seek = function(p) {
  this.pointer = p;
};
NetworkBuff.prototype.readByte = function() {
  var sliced = this.ba.slice(this.pointer++);
  return sliced.readUInt8(0);
};
NetworkBuff.prototype.readFully = function(dest) {
  this.ba.copy(dest, 0, this.pointer);
  this.pointer += dest.length;
  return dest;
};
NetworkBuff.prototype.getFilePointer = function() {
  return this.pointer;
};
NetworkBuff.prototype.close = function() {
  this.closed = true;
};

module.exports = NetworkBuff;
