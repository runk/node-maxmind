node-maxmind [![Build Status](https://travis-ci.org/runk/node-maxmind.png)](https://travis-ci.org/runk/node-maxmind)
========

IP geo lookup using Maxmind databases, written in pure javascript with no dependencies.

## GEO databases

Free GEO databases available for download here: http://dev.maxmind.com/geoip/geolite.


## Installation

    npm install maxmind


## Main features

 - Location lookup
 - Region Loopup
 - Country lookup
 - Distance between two IP addresses (locations)
 - Timezone lookup by IP
 - Autonomous System Numbers (ASN) lookup

## Usage

** see code samples in `./examples` directory **


```javascript
var maxmind = require('maxmind');

// City/Location lookup
maxmind.init('/path/to/GeoLiteCity.dat');
var location = maxmind.getLocation('66.6.44.4');

// Country Lookup
maxmind.init('/path/to/GeoIP.dat');
var country = maxmind.getCountry('66.6.44.4');

// Autonomous System Numbers (ASN) lookup
maxmind.init('/path/to/GeoIPASNum.dat');
var org = maxmind.getOrganization('66.6.44.4');

```


You can initialize module with several databases at once, and proper db will be automatically selected
for particular query. If any options given they apply for all databases you initialize.

```javascript
var maxmind = require('maxmind');
maxmind.init(['/path/to/GeoLiteCity.dat', '/path/to/GeoIPASNum.dat']);
// now both org and location lookups will work
var org = maxmind.getOrganization('66.6.44.4');
var location = maxmind.getLocation('66.6.44.4');
```

## Options

By default module does not use cache, and works directly with file system. Enabling cache
leads to better performance though consumes more memory.

- `indexCache` saves in memory the country index only
- `memoryCache` saves in memory full database file
- `checkForUpdates` checks databases for updates (via fs mtime)

If you decided to enable some options you can pass it as a flag in `init` method:

```javascript
var maxmind = require('maxmind');
maxmind.init('/path/to/GeoIP.dat', { indexCache: true });
```

Caching could significantly increase performance, refer to this camparison which was made on average
laptop:

- default: 20,000 lookups / second
- `indexCache`: 115,000 lookups / second
- `memoryCache`: 200,000 lookups / second

## Tests

If you want to run tests you will need `mocha` installed, then just run it:

    $ npm test


## Disclaimer

Module is quite young and serious bugs are possible. Feel free to
send pull request / bug reports.

