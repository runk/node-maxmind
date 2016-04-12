var geoiplite = require('geoip-lite');
var geoip = require('geoip');
var maxmind = require('./lib/lookup_service');

function randip() {
  return Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254) + '.' +
    Math.ceil(Math.random() * 254);
}


var suite = {};
suite['geoip-lite'] = {
  init: function() {},
  run: function() {
    geoiplite.lookup(randip());
  }
};
suite['geoip'] = {
  init: function() {
    this.db = new geoip.City(__dirname + '/test/dbs/GeoIPCity.dat');
  },
  run: function() {
    this.db.lookupSync(randip());
  }
};
suite['node-maxmind'] = {
  init: function() {
    maxmind.init(__dirname + '/test/dbs/GeoIPCity.dat', {memoryCache: true});
  },
  run: function() {
    maxmind.getLocation(randip());
  }
};


var n = 1000000,
  best = Infinity,
  results = [];

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

results.sort(function(a, b) {
  return a.time - b.time;
}).forEach(function(result) {
  slower = result.time > best ? (result.time/best * 100 - 100).toFixed(2) + '% slower' : '';
  console.log("%s\t%s op/sec\t%s", result.name, ~~(n / result.time * 1000), slower);
});


/*
Date: 2016/04, laptop: mbp i5 2.7
node-maxmind  468823 op/sec
geoip-lite  322061 op/sec 45.57% slower
geoip 153515 op/sec 205.39% slower
*/
