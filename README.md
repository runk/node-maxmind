# node-maxmind

Javascript module for Geo IP lookup using Maxmind binary databases (aka mmdb or geoip2).
Fastest Maxmind lookup library available - up to [17,000% faster](https://github.com/runk/node-maxmind-benchmark) than other libraries. Module has 100% test coverage with comprehensive test suite. It natively works with binary Maxmind database format and doesn't require any "CSV - {specific lib format}" conversions as some other modules do. Maxmind binary databases are highly optimized for size and performance so there's no point using other formats.

## GEO databases

You might want to use [geolite2](https://github.com/runk/node-geolite2) module with free geo databases. Alternatively, free databases available for [download here](http://dev.maxmind.com/geoip/geoip2/geolite2/). If you need better accuracy you should consider buying [commercial subscription](https://www.maxmind.com/en/geoip2-databases).

## Installation

```shell
npm i maxmind
```

## Usage

```typescript
import maxmind, { CityResponse } from 'maxmind';

const lookup = await maxmind.open<CityResponse>('/path/to/GeoLite2-City.mmdb');
console.log(lookup.get('66.6.44.4')); // inferred type maxmind.CityResponse

console.log(lookup.getWithPrefixLength('66.6.44.4')); // tuple with inferred type [maxmind.CityResponse|null, number]
```

### Sync API

You can use `Reader` class directly in case if you would want to instantiate it in non-async fashion. Use cases would include receiving a buffer database over network, or just reading it synchronously from disk.

```typescript
import { Reader } from 'maxmind';
const buffer = fs.readFileSync('./db.mmdb');
const lookup = new Reader<CityResponse>(buffer);
const city = lookup.get('8.8.8.8');

const [city2, prefixLength] = lookup.getWithPrefixLength('66.6.44.4');
```

Supported response types:

```
- CountryResponse
- CityResponse
- AnonymousIPResponse
- AsnResponse
- ConnectionTypeResponse
- DomainResponse
- IspResponse
```

## IPv6 Support

Module is fully compatible with IPv6. There are no differences in API between IPv4 and IPv6.

```javascript
const lookup = await maxmind.open('/path/to/GeoLite2.mmdb');
const location = lookup.get('2001:4860:0:1001::3004:ef68');
```

## Options

_maxmind.open(filepath, [options])_

- `filepath`: `<string>` Path to the binary mmdb database file.
- `options`: `<Object>`
  - `cache`: `<Object>` Cache options. Under the bonnet module uses [tiny-lru](https://github.com/avoidwork/tiny-lru) cache.
    - `max`: `<number>` Max cache items to keep in memory. _Default_: `6000`.
  - `watchForUpdates`: `<boolean>` Supports reloading the reader when changes occur to the database that is loaded. _Default_: `false`.
  - `watchForUpdatesNonPersistent`: `<boolean>` Controlls wether the watcher should be persistent or not. If it is persistent, a node process will be blocked in watching state if the watcher is the only thing still running in the program. _Default_: `false`.
  - `watchForUpdatesHook`: `<Function>` Hook function that is fired on database update. _Default_: `null`.

## Does it work in browser?

Current module is designed to work in node.js environment. Check out [mmdb-lib](https://github.com/runk/mmdb-lib) that's used under the bonnet - it's environment agnostic and does work in browser.

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

- [MMDB library](https://github.com/runk/mmdb-lib)
- MaxMind DB file format specification http://maxmind.github.io/MaxMind-DB/
- MaxMind test/sample DB files https://github.com/maxmind/MaxMind-DB
- GeoLite2 Free Downloadable Databases http://dev.maxmind.com/geoip/geoip2/geolite2/
- Great talk about V8 performance https://www.youtube.com/watch?v=UJPdhx5zTaw
- V8 Optimization killers https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
- More V8 performance tips http://www.html5rocks.com/en/tutorials/speed/v8/

## License

MIT
