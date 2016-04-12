var assert = require('assert'),
  DynBuffer = require('../lib/dyn_buffer');

describe('lib/dyn_buffer', function() {

  var source = new Buffer('This is a testing source buffer');


  describe('constructor()', function() {
    it('should create new instance', function() {
      var buff = new DynBuffer(source, 10, 7);
    });
  });


  describe('at()', function() {
    var buff = new DynBuffer(source, 10, 7);

    it('should return correct data', function() {
      assert.equal(buff.at(0), 116); // t
      assert.equal(buff.at(1), 101); // e
      assert.equal(buff.at(2), 115); // s
      assert.equal(buff.at(3), 116); // t
      assert.equal(buff.at(4), 105); // i
      assert.equal(buff.at(5), 110); // n
      assert.equal(buff.at(6), 103); // g
    });

    it('should return correct data even after limit', function() {
      assert.equal(buff.at(7),  32); // ' '
      assert.equal(buff.at(8), 115); // s
    });
  });


  describe('range()', function() {
    var buff = new DynBuffer(source, 10, 7);

    it('should return correct data', function() {
      assert.deepEqual(buff.range(0, 7), [116, 101, 115, 116, 105, 110, 103]);
    });
  });

});
