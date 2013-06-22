
var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoIPASNum.dat');
console.log(maxmind.getOrganization('66.6.44.4'));
