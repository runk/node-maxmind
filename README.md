node-maxmind [![Build Status](https://travis-ci.org/runk/node-maxmind.png)](https://travis-ci.org/runk/node-maxmind)
========

Pure Javascript module for Geo IP lookup using Maxmind binary databases (aka mmdb or geoip2).
Fastest Maxmind lookup library available - up to [8000% faster](https://github.com/runk/node-maxmind-benchmark) than other libraries. Module has 100% test coverage with comprehensive test suite. It natively works with binary Maxmind database format and doesn't require any "CSV - {specific lib format}" conversions as some other modules do. Maxmind binary databases are highly optimized for size and performance so there's no point working with other than that format.


## GEO databases

Free GEO databases are available for [download here](http://dev.maxmind.com/geoip/geoip2/geolite2/). If you need better accuracy you should consider buying [commercial subscription](https://www.maxmind.com/en/geoip2-databases).


## Installation

    npm i maxmind


## Usage

```javascript
var maxmind = require('maxmind');

var cityLookup = maxmind.open('/path/to/GeoLite2-City.mmdb');
var city = cityLookup.get('66.6.44.4');

var orgLookup = maxmind.open('/path/to/GeoOrg.mmdb');
var organization = orgLookup.get('66.6.44.4');
```


## V6 Support

Module is fully campatible with IPv6. There are no differences in API between IPv4 and IPv6.

```javascript
var lookup = maxmind.open('/path/to/GeoLite2.mmdb');
var location = maxmind.get('2001:4860:0:1001::3004:ef68');
```


## Options

Right now the only option you can configure is cache. Module uses [lru-cache](https://github.com/isaacs/node-lru-cache). You can configure its settings by doing following:

```javascript
var lookup = maxmind.open('/path/to/GeoLite2.mmdb', {
  cache: {
    max: 1000, // max items in cache
    maxAge: 1000 * 60 * 60 // life time in milliseconds
  }
})
lookup.get('1.1.1.1');
```


## IP addresses validation

Module supports validation for both IPv4 and IPv6:

```javascript
maxmind.validate('66.6.44.4'); // returns true
maxmind.validate('66.6.44.boom!'); // returns false

maxmind.validate('2001:4860:0:1001::3004:ef68'); // returns true
maxmind.validate('2001:4860:0:1001::3004:boom!'); // returns false
```


## GeoIP Legacy binary format

In case you want to use legacy GeoIP binary databases you should use [maxmind@0.6](https://github.com/runk/node-maxmind/releases/tag/v0.6.0).


## References
 - Loosely based on https://github.com/PaddeK/node-maxmind-db
 - MaxMind DB file format specification http://maxmind.github.io/MaxMind-DB/
 - MaxMind test/sample DB files https://github.com/maxmind/MaxMind-DB
 - GeoLite2 Free Downloadable Databases http://dev.maxmind.com/geoip/geoip2/geolite2/

## License

MIT
