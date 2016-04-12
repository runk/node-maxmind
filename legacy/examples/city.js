var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoLiteCity.dat');

// The returned location object has the following properties:
// countryCode, countryName, region, city, latitude, longitude
// postalCode, metroCode, dmaCode, areaCode
console.log('Location:', maxmind.getLocation('66.6.44.4'));
