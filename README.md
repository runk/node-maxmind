
node-maxmind
========

IP geo lookup using Maxmind databases, written in pure javascript with no dependencies.

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

```js
    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoLiteCity.dat');
    console.log(maxmind.getLocation("66.6.44.4"));
```

Country Lookup

```js
    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoIP.dat');
    console.log(maxmind.getCountry("66.6.44.4"));
```

## Caching

By default module does not use cache, and works directly with file system. Enabling cache
leads to better performance, howerver consumer more memory. Currently module supports two options:

- `indexCache` saves in memory only the country index
- `memoryCache` saves in memory full database file

If you decided to enable caching you can pass it as a flag in `init` method:

```js
    var maxmind = require('maxmind');
    maxmind.init('/path/to/GeoIP.dat', { indexCache: true });
```

Caching could significantly increase performance, refer to this camparison which was made on average
laptop:

- default: 18,000 lookups / second
- `indexCache`: 80,000 lookups / second
- `memodyCache`: 130,000 lookups / second

## Tests

If you want ot run tests you will need `mocha` installed, then just run it:

    $ mocha


## Disclaimer

Module is quite young and serious bugs are possible. Feel free to
send pull request / bug reports.

