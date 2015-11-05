var maxmind = require('maxmind');
var timeZone = require('maxmind/lib/time_zone');

maxmind.init(__dirname + '/GeoLiteCity.dat');

var location = maxmind.getLocation('66.6.44.4');

console.log('countryCode\t', location.countryCode);
console.log('countryName\t', location.countryName);
console.log('timeZone\t', timeZone(location.countryCode, location.region));
