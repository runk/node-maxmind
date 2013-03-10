
node-maxmind
========

IP geo lookup using Maxmind databases, written in pure javascript, with no dependencies.

## GEO databases

You can download free geo databases here: http://dev.maxmind.com/geoip/geolite.


## Installation

    npm install maxmind


## Main features

 - Location lookup
 - Country lookup
 - Distance between two IP addresses (locations)
 - Timezone lookup by IP

## Usage

** see code samples in `./examples` directory **

City/Location lookup

    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoLiteCity.dat')
    console.log(maxmind.getLocation("66.6.44.4"));

Country Lookup

    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoIP.dat')
    console.log(maxmind.getCountry("66.6.44.4"));

## Disclaimer

Module is quite young and some serious bugs are possible. Feel free to
send pull request / bug reports.

Module currently work only in `MEMORY_CACHE` mode.