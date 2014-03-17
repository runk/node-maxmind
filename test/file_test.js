var assert = require('assert'),
  File = require('../lib/file');

const TEST_FILE = __dirname + '/dbs/test.dat';


describe('lib/file', function() {

  var file = new File(TEST_FILE);

  describe('length()', function() {
    it('should return correct length', function() {
      assert.equal(file.length(), 6);
    });
  });


  describe('readByte()', function() {
    it('should return correct value (1)', function() {
      assert.equal(file.readByte(), 97);
      assert.equal(file.readByte(), 98);
      assert.equal(file.readByte(), 99);
      assert.equal(file.getFilePointer(), 3);
    });

    it('should return correct value (2)', function() {
      file.seek(5);
      assert.equal(file.readByte(), 102);
      assert.equal(file.getFilePointer(), 6);
    });
  });


  describe('readFully()', function() {
    it('should return bytes 0-2', function() {
      file.seek(0);
      var b = new Buffer(3);
      file.readFully(b);

      assert.equal(b.length, 3);
      assert.equal(b.toString(), 'abc');
      assert.equal(file.getFilePointer(), 3);
    });

    it('should return bytes 2-5', function() {
      file.seek(2);
      var b = new Buffer(4);
      file.readFully(b);

      assert.equal(b.length, 4);
      assert.equal(b.toString(), 'cdef');
      assert.equal(file.getFilePointer(), 6);
    });
  });

});
