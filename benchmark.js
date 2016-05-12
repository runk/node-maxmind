
function randip() {
  return Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254);
}


var DB_FILE = './test/dbs/full/GeoLite2-City.mmdb';

var my = require('./');
var countries2 = my.open(DB_FILE);

var MMDBReader = require('mmdb-reader');
var reader = new MMDBReader(DB_FILE);
// console.log(reader.cachedRead(20772773).value)
// process.exit()


// var Benchmark = require('benchmark');

// var suite = new Benchmark.Suite();

// // add tests
// suite.add('maxmind', {
//   minSamples: 50,
//   // minTime: 10,
//   fn: function() {
//     countries2.reader.findAddressInTree(randip());
//   }
// })
// .add('mmdb-reader', {
//   minSamples: 50,
//   // minTime: 10,
//   fn: function() {
//     reader.lookup(randip())
//   }
// })
// .on('cycle', function(event) {
//   console.log(String(event.target));
// })
// .on('complete', function() {
//   console.log('Fastest is ' + this.filter('fastest').map('name'));
// })
// .run();


var n = 500000,
  best = Infinity,
  results = [];


// console.profile('build');

var s = Date.now()
for (var i = 0; i < n; i++) {
  countries2.reader.findAddressInTree(randip());
  // 203169 ops/s
  // 313087 ops/s
  // 502k ops/s
  // 507k

  // countries2.get(randip())
  // 120k ops/s

  // countries2.reader.resolveDataPointer(2875603);
  //36000 ops/s


  // reader.readData(20772773)
  // 10000 ops/s
  // reader.lookup(randip())
  // 142k ops/s
  // reader.lookup(randip())
  // 473k ops/s
}
var f = Date.now();

console.log(n, 'iterations')
console.log(f - s, 'ms')
console.log(~~(n / ((f - s) / 1000)), "op/sec");
console.log(process.memoryUsage())

// console.profileEnd('build');
