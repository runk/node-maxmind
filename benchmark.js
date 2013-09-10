
var fs = require('fs');
var ls = require('./lib/lookup_service');

function randip() {
    return [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255)
    ].join('.');
}

ls.init('./test/dbs/GeoIPCity.dat', { memoryCache: true });
var ips = fs.readFileSync('./test/dbs/full/ips.txt');
ips = ips.toString().split("\n").map(function(line) {
    return line.trim();
});

var n = ips.length;
var s = new Date().getTime();

for (var i = ips.length - 1; i >= 0; i--) {
    ls.getLocation(ips[i]);
};

console.log('n: ', n);
console.log('time:', (new Date().getTime() - s), "msec");
console.log('speed:', Math.round(n / (new Date().getTime() - s) * 1000), 'per sec');
