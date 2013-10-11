
var ls = require('./lib/lookup_service');

function randip() {
  return Math.floor(Math.random() * 255) + '.' +
    Math.floor(Math.random() * 255) + '.' +
    Math.floor(Math.random() * 255) + '.' +
    Math.floor(Math.random() * 255);
}

ls.init('./test/dbs/GeoIPCity.dat', { memoryCache: true });

var s = new Date().getTime();
var n = 1000000;

for (var i = 0; i < n; i++)
  ls.getLocation(randip())

console.log('n: ', n);
console.log('time:', (new Date().getTime() - s), "msec");
console.log('speed:', Math.round(n / (new Date().getTime() - s) * 1000), 'per sec');
