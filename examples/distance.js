var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoLiteCity.dat');

var fromLocation = maxmind.getLocation('66.6.44.4');
var toLocation = maxmind.getLocation('213.180.193.3');

console.log('From:\t', fromLocation.countryName, fromLocation.city);
console.log('To:\t', toLocation.countryName, toLocation.city);
console.log('Dist:\t', toLocation.distance(fromLocation));
