function DynBuffer(source, offset, length) {
    this.source = source;
    this.offset = offset;
    this.length = length;
}
DynBuffer.prototype.source = null;
DynBuffer.prototype.offset = null;
DynBuffer.prototype.length = null;
DynBuffer.prototype.toString = function(encoding, start, end) {
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

module.exports = DynBuffer;
