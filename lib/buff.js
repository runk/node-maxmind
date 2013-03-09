var util = require('util'),
    Buffer = require('buffer').Buffer;

//  http://docs.oracle.com/javase/6/docs/api/java/io/RandomAccessFile.html

function Buff(ba) {
    this.ba = ba;
};
Buff.prototype.ba = null;
Buff.prototype.pointer = 0;
Buff.prototype.length = function() {
    return this.ba.length;
};
Buff.prototype.seek = function(p) {
    this.pointer = p;
};
Buff.prototype.readByte = function() {
    return this.ba.readUInt8(this.pointer++);
};
Buff.prototype.read = function(dest) {
    var len = this.ba.copy(dest, 0, this.pointer, this.pointer + dest.length);
    this.pointer += len;
    return len;
};
Buff.prototype.readFully = function(dest) {
    var len = this.ba.copy(dest, 0, this.pointer, this.pointer + dest.length);
    this.pointer += len;
    return len;
};
Buff.prototype.getFilePointer = function() {
    return this.pointer;
};
Buff.prototype.close = function() {
    // do nothing atm
};



module.exports = Buff;