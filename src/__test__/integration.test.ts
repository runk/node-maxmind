import assert from 'assert';
import ipaddr from 'ip-address';
import path from 'path';
import maxmind from '../index';
import Reader from '../reader';
import { Response } from '../reader/response';

const dataDir = path.join(__dirname, '../../test/data/test-data');
const srcDir = path.join(__dirname, '../../test/data/source-data');

const actual = (file: string) => {
  const data = require(path.join(srcDir, file));
  const hash: Record<string, any> = {};
  data.forEach((item: any) => {
    for (const key in item) {
      hash[key] = item[key];
    }
  });

  return {
    hash,
    get: (subnet: string) => {
      const item = hash[subnet];
      assert(item);
      return item;
    },
  };
};

describe('maxmind', () => {
  describe('basic functionality', () => {
    it('should successfully handle database', async () => {
      await maxmind.open(path.join(dataDir, 'GeoIP2-City-Test.mmdb'));
    });

    it('should fetch geo ip', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'GeoIP2-City-Test.mmdb')
      );
      const data = actual('GeoIP2-City-Test.json');
      assert.deepEqual(geoIp.get('1.1.1.1'), null);

      assert.deepEqual(geoIp.get('175.16.198.255'), null);
      assert.deepEqual(
        geoIp.get('175.16.199.1'),
        data.get('::175.16.199.0/120')
      );
      assert.deepEqual(
        geoIp.get('175.16.199.255'),
        data.get('::175.16.199.0/120')
      );
      assert.deepEqual(
        geoIp.get('::175.16.199.255'),
        data.get('::175.16.199.0/120')
      );
      assert.deepEqual(geoIp.get('175.16.200.1'), null);

      assert.deepEqual(
        geoIp.get('2a02:cf40:ffff::'),
        data.get('2a02:cf40::/29')
      );
      assert.deepEqual(
        geoIp.get('2a02:cf47:0000::'),
        data.get('2a02:cf40::/29')
      );
      assert.deepEqual(geoIp.get('2a02:cf48:0000::'), null);
    });

    it('should handle corrupt database', async () => {
      await maxmind
        .open('./data/README.md')
        .then(() => Promise.reject(new Error('Should not happen')))
        .catch((err) => {
          assert(err.message, 'asda');
        });
    });

    it('should accept cache options', async () => {
      assert(
        await maxmind.open(path.join(dataDir, 'GeoIP2-City-Test.mmdb'), {
          cache: { max: 1000 },
        })
      );
    });
  });

  describe('section: data', () => {
    it('should decode all possible types - complex', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-test-decoder.mmdb')
      );
      assert.deepEqual(geoIp.get('::1.1.1.1'), {
        array: [1, 2, 3],
        boolean: true,
        bytes: Buffer.from([0, 0, 0, 42]),
        double: 42.123456,
        // It should be 1.1, but there's some issue with rounding in v8
        float: 1.100000023841858,
        int32: -268435456,
        map: { mapX: { arrayX: [7, 8, 9], utf8_stringX: 'hello' } },
        uint128: '1329227995784915872903807060280344576',
        uint16: 100,
        uint32: 268435456,
        uint64: '1152921504606846976',
        utf8_string: 'unicode! ☯ - ♫',
      });
    });

    it('should decode all possible types - zero/empty values', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-test-decoder.mmdb')
      );
      assert.deepEqual(geoIp.get('::0.0.0.0'), {
        array: [],
        boolean: false,
        bytes: Buffer.from([]),
        double: 0,
        float: 0,
        int32: 0,
        map: {},
        uint128: '0',
        uint16: 0,
        uint32: 0,
        uint64: '0',
        utf8_string: '',
      });
    });

    it('should return correct value: string entries', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-string-value-entries.mmdb')
      );
      assert.equal(geoIp.get('1.1.1.1'), '1.1.1.1/32');
      assert.equal(geoIp.get('1.1.1.2'), '1.1.1.2/31');
      assert.equal(geoIp.get('175.2.1.1'), null);
    });
  });

  describe('section: binary search tree', () => {
    const files = [
      'GeoIP2-Anonymous-IP-Test',
      'GeoIP2-City-Test',
      'GeoIP2-Connection-Type-Test',
      'GeoIP2-Country-Test',
      'GeoIP2-Domain-Test',
      'GeoIP2-Enterprise-Test',
      'GeoIP2-ISP-Test',
      'GeoIP2-Precision-City-Test',
      'GeoIP2-Precision-ISP-Test',
    ];

    const tester = (geoIp: Reader<Response>, data: any) => {
      for (const subnet in data.hash) {
        const ip = new ipaddr.Address6(subnet);
        // TODO: check random address from the subnet?
        // see http://ip-address.js.org/#address4/biginteger
        // see https://github.com/andyperlitch/jsbn
        assert.deepEqual(
          geoIp.get(ip.startAddress().address),
          data.hash[subnet],
          subnet
        );
        assert.deepEqual(
          geoIp.get(ip.endAddress().address),
          data.hash[subnet],
          subnet
        );
      }
    };

    files.forEach((file) => {
      it('should test everything: ' + file, async () => {
        const geoIp = await maxmind.open(
          path.join(dataDir, '/' + file + '.mmdb')
        );
        const data = actual(file + '.json');
        tester(geoIp, data);
      });
    });
  });
});
