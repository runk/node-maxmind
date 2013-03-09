
node-maxmind
========

IP lookup using Maxmind databases, written in pure javascript

## GEO databases

You can download free geo databases here: http://dev.maxmind.com/geoip/geolite.


## Installation

    npm install maxmind

## Usage

City/Location lookup

    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoLiteCity.dat')
    console.log(maxmind.getLocation("87.229.134.24"));

Country Lookup

    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoIP.dat')
    console.log(maxmind.getCountry("87.229.134.24"));

## Disclaimer

Module is quite fresh and some sirius bugs are possible. Feel free to
send pull request / bug reports.

Module currently work only in MEMORY_CACHE mode.