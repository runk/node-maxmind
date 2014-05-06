var assert = require('assert'),
  NetworkBuff = require('../lib/network-buff');

const TEST_FILE = 'http://localhost/test.dat';

describe('lib/network-buff', function() {

  var buff;
  before(function(done) {
    buff = new NetworkBuff(TEST_FILE, function(complete) { 
      if(complete) done();
    });
  });

  describe('length()', function() {
    it('should return correct length', function() {
      assert.equal(buff.length(), 6);
    });
  });


  describe('readByte()', function() {
    it('should return correct value (1)', function() {
      assert.equal(buff.readByte(), 97);
      assert.equal(buff.readByte(), 98);
      assert.equal(buff.readByte(), 99);
      assert.equal(buff.getFilePointer(), 3);
    });

    it('should return correct value (2)', function() {
      buff.seek(5);
      assert.equal(buff.readByte(), 102);
      assert.equal(buff.getFilePointer(), 6);
    });
  });


  describe('readFully()', function() {
    it('should return bytes 0-2', function() {
      buff.seek(0);
      var b = new Buffer(3);
      buff.readFully(b);

      assert.equal(b.length, 3);
      assert.equal(b.toString(), 'abc');
      assert.equal(buff.getFilePointer(), 3);
    });

    it('should return bytes 2-5', function() {
      buff.seek(2);
      var b = new Buffer(4);
      buff.readFully(b);
      assert.equal(b.length, 4);
      assert.equal(b.toString(), 'cdef');
      assert.equal(buff.getFilePointer(), 6);
    });
  });

});
