var fs = require('fs');

// http://docs.oracle.com/javase/6/docs/api/java/io/RandomAccessFile.html

function Buff(path) {
  this.meta = fs.statSync(path);
  this.ba = fs.openSync(path, 'r');
}
Buff.prototype.ba = null;
Buff.prototype.meta = null;
Buff.prototype.pointer = 0;
Buff.prototype.closed = false;
Buff.prototype.length = function() {
  return this.meta.size;
};
Buff.prototype.seek = function(p) {
  this.pointer = p;
};
Buff.prototype.readByte = function() {
  var b = new Buffer(1);
  fs.readSync(this.ba, b, 0, 1, this.pointer++);
  return b.readUInt8(0);
};
Buff.prototype.readFully = function(dest) {
  var len = fs.readSync(this.ba, dest, 0, dest.length, this.pointer);
  this.pointer += len;
  return len;
};
Buff.prototype.getFilePointer = function() {
  return this.pointer;
};
Buff.prototype.close = function() {
  if (this.ba && !this.closed)
    fs.closeSync(this.ba);
  this.closed = true;
};

module.exports = Buff;
