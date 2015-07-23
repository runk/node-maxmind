node-maxmind [![Build Status](https://travis-ci.org/runk/node-maxmind.png)](https://travis-ci.org/runk/node-maxmind)
========

Native Javascript module for IP GEO lookup using Maxmind databases.
Up to [500% faster](https://github.com/runk/node-maxmind#performance--benchmark) than other GEO lookup libraries.
No binary or whatsoever dependencies.

## GEO databases

Free GEO databases are available for [download here](http://dev.maxmind.com/geoip/geolite). The npm package [maxmind-geolite-mirror](https://www.npmjs.com/package/maxmind-geolite-mirror) will mirror the databases locally and only re-fetch if the remote files are newer.


## Installation

    npm i maxmind


## Main features

 - Country/Region/Location lookup by IP (v4 and v6)
 - Distance between two IP addresses (locations)
 - Timezone lookup by IP
 - Autonomous System Numbers (ASN) lookup by IP
 - Network speed lookup by IP

Module written in pure Javascript with no dependencies. Being able to work with binary Maxmind databases it doesn't
require any "CSV - {specific lib format}" conversions as other modules do. Maxmind binary databases are highly optimized
for size and performance so there's no point working with other than that format.

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
var org = maxmind.getAsn('66.6.44.4');

// Internet Service Provider (ISP) lookup
maxmind.init('/path/to/GeoISP.dat');
var org = maxmind.getIsp('66.6.44.4');

// Net Speed lookup
maxmind.init('/path/to/GeoIPNetSpeedCell.dat');
var speed = maxmind.getNetSpeed('89.66.148.0');

// Organization lookup
maxmind.init('/path/to/GeoIPOrg.dat');
var org = maxmind.getOrganization('66.6.44.4');
```

## V6 Support

Module is fully campatible with IPv6 maxmind databases. Make sure you initialize with
proper IPv6 databases before making queries.

```javascript
maxmind.init('/path/to/GeoLiteCityV6.dat');
var location = maxmind.getLocationV6('2001:4860:0:1001::3004:ef68');
```

All methods works in the same way as for IPv4, the only difference is `V6` postfix in method names:
`getCountryV6`, `getLocationV6` and `getOrganizationV6`.

You can initialize module with several databases at once, and proper db will be automatically selected
for particular query. If any option is given it applies to all databases you initialize.

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
- `checkForUpdates` checks databases for updates (via fs mtime). Basically once you replace the old DB file with
  the new one module automamtically re-initialises.

Options can be passed to `init` method:

```javascript
var maxmind = require('maxmind');
maxmind.init('/path/to/GeoIP.dat', {indexCache: true, checkForUpdates: true});
```

## IP addresses validation

Module supports validation for both IPv4 and IPv6 via the same function:

```
maxmind.validate('66.6.44.4'); // returns true
maxmind.validate('66.6.44.boom!'); // returns false

maxmind.validate('2001:4860:0:1001::3004:ef68'); // returns true
maxmind.validate('2001:4860:0:1001::3004:boom!'); // returns false
```

## Performance / Benchmark

Caching significantly increases performance, refer to this camparison which was made on average
laptop:

- default: 20,000 lookups / second
- `indexCache`: 115,000 lookups / second
- `memoryCache`: 270,000 lookups / second


Following benchmark is made for `GeoIPCity` database. Memory caching is enabled where possible. If you believe that
benchmark is not realistic please post a PR and share your code :)

```
node-maxmind  274649 op/sec
geoip-lite    191681 op/sec 43.28% slower
geoip         43483 op/sec  531.61% slower
```


## Contributing

Make sure you run `npm i` command in the project's dir before you begin, it'll install all dev dependencies. Currently
code coverage is about **85%**, so new tests are essential when you add new functionality. There're several npm tasks
which you can find useful:

- `npm test` runs tests
- `npm run lint` runs js linter
- `npm run coverage` runs code coverage task and generates report
- `npm run benchmark` runs basic benchmark

One pull request per one feature, nothing unusual.


## References
 - Timezones http://www.maxmind.com/timezone.txt
 - Region codes http://www.maxmind.com/app/iso3166_2


## License

MIT
