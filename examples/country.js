
var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoIP.dat');

var c = maxmind.getCountry("66.6.44.4");

console.log('countryCode\t', c.code);
console.log('countryName\t', c.name);
