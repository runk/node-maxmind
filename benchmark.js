
var fs = require('fs');
var ls = require('./lib/lookup_service');


ls.init('./test/dbs/GeoLiteCity.dat');
var ips = fs.readFileSync('./test/dbs/ips.txt');

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

// console.log(ls.dump())

// var time = process.hrtime();
// var diff = process.hrtime(time);
// console.log((diff[0] * 1e9 + diff[1]) / 1e9);
