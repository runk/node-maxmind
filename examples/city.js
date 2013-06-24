
var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoLiteCity.dat');

var l = maxmind.getLocation("66.6.44.4");

console.log('countryCode\t', l.countryCode);
console.log('countryName\t', l.countryName);
console.log('region\t\t', l.region);
console.log('city\t\t', l.city);
console.log('postalCode\t', l.postalCode);
console.log('latitude\t', l.latitude);
console.log('longitude\t', l.longitude);
console.log('metroCode\t', l.metroCode);
console.log('dmaCode\t', l.dmaCode);
console.log('areaCode\t', l.areaCode);
