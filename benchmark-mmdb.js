
function randip() {
  return Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254);
}


var DB_FILE = './test/dbs/full/GeoLite2-City.mmdb';
var jGeoIP = require('jgeoip');
var geoip = new jGeoIP(DB_FILE);


var suite = {};


// suite['jgeoip'] = {
//   init: function() {},
//   run: function() {
//     geoip.getRecord(randip());
//   }
// };

// var mmdbreader = require('maxmind-db-reader');
// // open database
// var countries = mmdbreader.openSync(DB_FILE);


// suite['maxmind-db-reader'] = {
//   init: function() {},
//   run: function() {
//     countries.getGeoDataSync(randip())
//   }
// };

// var MMDBReader = require('mmdb-reader');
// var reader = new MMDBReader(DB_FILE);

// suite['mmdb-reader'] = {
//   init: function() {},
//   run: function() {
//     reader.lookup(randip());
//   }
// };

// var geoip2 = require('geoip2');
// geoip2.init(DB_FILE);

// suite['geoip2'] = {
//   init: () => {},
//   run: () => {
//     geoip2.lookupSync(randip());
//   }
// }

var my = require('./');
// open database
var countries2 = my.openSync(DB_FILE);


suite['my'] = {
  init: function() {},
  run: function() {
    // countries2.reader.findAddressInTree('1.2.3.4');
    // countries2.reader.resolveDataPointerSync(2875603)
    countries2.getGeoDataSync(randip())
  }
};


var n = 50000,
  best = Infinity,
  results = [];


console.profile('build');
for (name in suite) {
  test = suite[name];
  test.init();

  var result = {
    name: name,
    started: new Date().getTime()
  };

  for (var i = 0; i < n; i++)
    test.run();


  result.time = new Date().getTime() - result.started;
  best = Math.min(best, result.time);
  results.push(result);
}
console.profileEnd('build');

results.sort(function(a, b) {
  return a.time - b.time;
}).forEach(function(result) {
  slower = result.time > best ? (result.time/best * 100 - 100).toFixed(2) + '% slower' : '';
  console.log("%s\t%s op/sec\t%s", result.name, ~~(n / result.time * 1000), slower);
});


/*
Date: 2016/04, laptop: mbp i5 2.7
mmdb-reader 124688 op/sec
jgeoip  43782 op/sec  184.79% slower
geoip2  22351 op/sec  457.86% slower
maxmind-db-reader 2679 op/sec 4554.11% slower
*/
