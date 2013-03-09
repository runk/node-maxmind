
var ls = require('./lib/lookup_service');


ls.init('./test/dbs/GeoLiteCity.dat');


var n = 500000;
var s = new Date().getTime();
for (var i = 0; i < n; i++) {
    ls.getLocation([
        Math.round(Math.random() * 254),
        Math.round(Math.random() * 254),
        Math.round(Math.random() * 254),
        Math.round(Math.random() * 254)
    ].join('.'));
};

console.log('n: ', n);
console.log('time:', (new Date().getTime() - s), "msec");
console.log('speed:', Math.round(n / (new Date().getTime() - s) * 1000), 'per sec');
