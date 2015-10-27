var maxmind = require('maxmind');
maxmind.init(__dirname + '/GeoIPASNum.dat');

console.log('ASN:', maxmind.getOrganization('66.6.44.4'));
