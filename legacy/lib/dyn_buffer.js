function DynBuffer(source, offset, length) {
  this.source = source;
  this.offset = offset;
  this.length = length;
}

DynBuffer.prototype.source = null;

DynBuffer.prototype.offset = null;

DynBuffer.prototype.length = null;

DynBuffer.prototype.toString = function(encoding, start, end) {
  // var a = new Array().slice.call(b, 0)
  // return String.fromCharCode.apply(String, a)
  return this.source.toString(encoding, this.offset + start, this.offset + end);
};

DynBuffer.prototype.readUInt8 = function(start) {
  return this.source.readUInt8(this.offset + start);
};

DynBuffer.prototype.pointer = function(start) {
  return this.offset + start;
};

DynBuffer.prototype.at = function(start) {
  return this.source[this.offset + start];
};

DynBuffer.prototype.range = function(start, end) {
  return Array.prototype.slice.call(this.source, this.offset + start, this.offset + end);
};

module.exports = DynBuffer;
