'use strict';

var assert = require('assert');
var maxmind = require('../index');


describe('index', function() {


  describe('validate()', function() {
    it('should work fine for IPv4', function() {
      assert.equal(maxmind.validate('64.4.4.4'), true);
      assert.equal(maxmind.validate('64.4.4.boom!'), false);
      assert.equal(maxmind.validate(undefined), false);
      assert.equal(maxmind.validate('kraken'), false);
    });

    it('should work fine for IPv6', function() {
      assert.equal(maxmind.validate('2001:4860:0:1001::3004:ef68'), true);
      assert.equal(maxmind.validate('::64.17.254.216'), true);
      assert.equal(maxmind.validate('2001:4860:0:1001::3004:boom!'), false);
    });
  });


  describe('init()', function() {
    it('should fail when someone tries to use legacy api', function() {
      assert.throws(function() {
        maxmind.init();
      }, /Maxmind v1 module has changed API/);
    });
  });

});
