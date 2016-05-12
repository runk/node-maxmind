
function randip() {
  return Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254);
}


var DB_FILE = './test/dbs/full/GeoLite2-City.mmdb';


var Benchmark = require('benchmark');

var suite = new Benchmark.Suite()
suite.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
});


/******************* Maxmind ***********************/
var my = require('./').open(DB_FILE);

suite.add('maxmind', {
  minSamples: 50,
  // minTime: 10,
  fn: function() {
    my.findAddressInTree(randip());
  }
});

/***************** mmdb-reader *********************/
var MMDBReader = require('mmdb-reader')(DB_FILE);

suite.add('mmdb-reader', {
  minSamples: 50,
  // minTime: 10,
  fn: function() {
    MMDBReader.lookup(randip())
  }
});

suite.run();


/*
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
*/
