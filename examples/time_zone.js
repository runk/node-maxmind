
var maxmind = require('maxmind'),
    timeZone = require('maxmind/lib/time_zone');

maxmind.init(__dirname + '/GeoLiteCity.dat');

var l = maxmind.getLocation("66.6.44.4");

console.log('countryCode\t', l.countryCode);
console.log('countryName\t', l.countryName);
console.log('timeZone\t', timeZone(l.countryCode, l.region));
