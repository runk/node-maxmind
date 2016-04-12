var fs = require('fs');

// Based on
// http://docs.oracle.com/javase/6/docs/api/java/io/RandomAccessFile.html

function File(path) {
  this.meta = fs.statSync(path);
  this.ba = fs.openSync(path, 'r');
}

File.prototype.ba = null;

File.prototype.meta = null;

File.prototype.pointer = 0;

File.prototype.closed = false;

File.prototype.length = function() {
  return this.meta.size;
};

File.prototype.seek = function(p) {
  this.pointer = p;
};

File.prototype.readByte = function() {
  var b = new Buffer(1);
  fs.readSync(this.ba, b, 0, 1, this.pointer++);
  return b.readUInt8(0);
};

File.prototype.readFully = function(dest) {
  var len = fs.readSync(this.ba, dest, 0, dest.length, this.pointer);
  this.pointer += len;
  return len;
};

File.prototype.getFilePointer = function() {
  return this.pointer;
};

File.prototype.close = function() {
  if (this.ba && !this.closed)
    fs.closeSync(this.ba);
  this.closed = true;
};

module.exports = File;
