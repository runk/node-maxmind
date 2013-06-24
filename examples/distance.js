
var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoLiteCity.dat');

var l1 = maxmind.getLocation("66.6.44.4");
var l2 = maxmind.getLocation("213.180.193.3");

console.log('From:\t', l1.countryName, l1.city);
console.log('To:\t', l2.countryName, l2.city);
console.log('Dist:\t', l2.distance(l1));
