'use strict';

/* eslint-disable no-console */
var path = require('path');

function randip() {
  return Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254);
}


var DB_FILE = path.join(__dirname, '/GeoLite2-City.mmdb');


var n = 500000;

// console.profile('build');

var my = require('../').open(DB_FILE);
var s = Date.now();
for (var i = 0; i < n; i++) {
  my.findAddressInTree(randip());
  // 203169 ops/s
  // 313087 ops/s
  // 502k ops/s
  // 507k

  // my.get(randip())
  // 120k ops/s

  // my.resolveDataPointer(2875603);
  //36000 ops/s


  // reader.readData(20772773)
  // 10000 ops/s
  // reader.lookup(randip())
  // 142k ops/s
  // reader.lookup(randip())
  // 473k ops/s
}
var f = Date.now();

console.log(n, 'iterations');
console.log(f - s, 'ms');
console.log(~~(n / ((f - s) / 1000)), 'op/sec');
console.log(process.memoryUsage());

// console.profileEnd('build');
