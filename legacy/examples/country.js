var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoIP.dat');

console.log('Country:', maxmind.getCountry('66.6.44.4'));
