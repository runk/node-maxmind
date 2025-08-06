import assert from 'assert';
import ip6addr from 'ip6addr';
import path from 'path';
import maxmind, { Reader, Response } from '../index';
import { Address6 } from 'ip-address';

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
      assert.deepStrictEqual(geoIp.get('1.1.1.1'), null);

      assert.deepStrictEqual(geoIp.get('175.16.198.255'), null);
      assert.deepStrictEqual(
        geoIp.get('175.16.199.1'),
        data.get('::175.16.199.0/120')
      );
      assert.deepStrictEqual(
        geoIp.get('175.16.199.255'),
        data.get('::175.16.199.0/120')
      );
      assert.deepStrictEqual(
        geoIp.get('::175.16.199.255'),
        data.get('::175.16.199.0/120')
      );
      assert.deepStrictEqual(geoIp.get('175.16.200.1'), null);

      assert.deepStrictEqual(
        geoIp.get('2a02:cf40:ffff::'),
        data.get('2a02:cf40::/29')
      );
      assert.deepStrictEqual(
        geoIp.get('2a02:cf47:0000::'),
        data.get('2a02:cf40::/29')
      );
      assert.deepStrictEqual(geoIp.get('2a02:cf48:0000::'), null);
    });

    it('should handle corrupt database', async () => {
      await maxmind
        .open(path.join(__dirname, '../../test/data/README.md'))
        .then(() => Promise.reject(new Error('Should not happen')))
        .catch((err) => {
          assert.deepStrictEqual(err.message, 'Unknown type 84 at offset 1');
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
      assert.deepStrictEqual(geoIp.get('::1.1.1.1'), {
        array: [1, 2, 3],
        boolean: true,
        bytes: Buffer.from([0, 0, 0, 42]),
        double: 42.123456,
        // It should be 1.1, but there's some issue with rounding in v8
        float: 1.100000023841858,
        int32: -268435456,
        map: { mapX: { arrayX: [7, 8, 9], utf8_stringX: 'hello' } },
        uint128: 1329227995784915872903807060280344576n,
        uint16: 100,
        uint32: 268435456,
        uint64: 1152921504606846976n,
        utf8_string: 'unicode! ☯ - ♫',
      });
    });

    it('should decode all possible types - zero/empty values', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-test-decoder.mmdb')
      );
      assert.deepStrictEqual(geoIp.get('::0.0.0.0'), {
        array: [],
        boolean: false,
        bytes: Buffer.from([]),
        double: 0,
        float: 0,
        int32: 0,
        map: {},
        uint128: 0n,
        uint16: 0,
        uint32: 0,
        uint64: 0n,
        utf8_string: '',
      });
    });

    it('should return correct value: string entries', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-string-value-entries.mmdb')
      );
      assert.strictEqual(geoIp.get('1.1.1.1'), '1.1.1.1/32');
      assert.strictEqual(geoIp.get('1.1.1.2'), '1.1.1.2/31');
      assert.strictEqual(geoIp.get('175.2.1.1'), null);
    });
  });

  describe('no IPv4 search tree', () => {
    it('IPv4 lookup should return correct data', async () => {
      const geoIp = await maxmind.open(
        path.join(dataDir, 'MaxMind-DB-no-ipv4-search-tree.mmdb')
      );
      assert.strictEqual(geoIp.get('1.1.1.1'), '::0/64');
      assert.strictEqual(geoIp.get('::1.1.1.1'), '::0/64');
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
      'GeoIP2-Precision-Enterprise-Test',
      'GeoLite2-ASN-Test',
    ];

    // Neither `ip-address` nor `ip6addr` cover all possible subnet notations,
    // hence using this dirty workaround.
    const getRange = (input: string): { first: string; last: string } => {
      try {
        const addr = new Address6(input);
        return {
          first: addr.startAddress().address,
          last: addr.endAddress().address,
        };
      } catch (e: unknown) {
        const err = e as Error;
        if (err.message == 'Incorrect number of groups found') {
          const addr = ip6addr.createCIDR(input);
          return {
            first: addr.first().toString(),
            last: addr.last().toString(),
          };
        }
        throw err;
      }
    };

    const tester = (geoIp: Reader<Response>, data: any) => {
      for (const subnet in data.hash) {
        const range = getRange(subnet);
        assert.deepStrictEqual(
          geoIp.get(range.first),
          data.hash[subnet],
          subnet
        );
        assert.deepStrictEqual(
          geoIp.get(range.last),
          data.hash[subnet],
          subnet
        );
      }
    };

    files.forEach((file) => {
      it('should test everything: ' + file, async () => {
        const geoIp = await maxmind.open<Response>(
          path.join(dataDir, '/' + file + '.mmdb')
        );
        const data = actual(file + '.json');
        tester(geoIp, data);
      });
    });
  });

  describe('getWithPrefixLength', () => {
    const decoderRecord = {
      array: [1, 2, 3],
      boolean: true,
      bytes: Buffer.from([0, 0, 0, 42]),
      double: 42.123456,
      float: 1.100000023841858,
      int32: -268435456,
      map: {
        mapX: {
          arrayX: [7, 8, 9],
          utf8_stringX: 'hello',
        },
      },
      uint128: 1329227995784915872903807060280344576n,
      uint16: 0x64,
      uint32: 268435456,
      uint64: 1152921504606846976n,
      utf8_string: 'unicode! ☯ - ♫',
    };
    const tests = [
      {
        ip: '1.1.1.1',
        dbFile: 'MaxMind-DB-test-ipv6-32.mmdb',
        expectedPrefixLength: 8,
        expectedRecord: null,
      },
      {
        ip: '::1:ffff:ffff',
        dbFile: 'MaxMind-DB-test-ipv6-24.mmdb',
        expectedPrefixLength: 128,
        expectedRecord: { ip: '::1:ffff:ffff' },
      },
      {
        ip: '::2:0:1',
        dbFile: 'MaxMind-DB-test-ipv6-24.mmdb',
        expectedPrefixLength: 122,
        expectedRecord: { ip: '::2:0:0' },
      },
      {
        ip: '1.1.1.1',
        dbFile: 'MaxMind-DB-test-ipv4-24.mmdb',
        expectedPrefixLength: 32,
        expectedRecord: { ip: '1.1.1.1' },
      },
      {
        ip: '1.1.1.3',
        dbFile: 'MaxMind-DB-test-ipv4-24.mmdb',
        expectedPrefixLength: 31,
        expectedRecord: { ip: '1.1.1.2' },
      },
      {
        ip: '1.1.1.3',
        dbFile: 'MaxMind-DB-test-decoder.mmdb',
        expectedPrefixLength: 24,
        expectedRecord: decoderRecord,
      },
      {
        ip: '::ffff:1.1.1.128',
        dbFile: 'MaxMind-DB-test-decoder.mmdb',
        expectedPrefixLength: 120,
        expectedRecord: decoderRecord,
      },
      {
        ip: '::1.1.1.128',
        dbFile: 'MaxMind-DB-test-decoder.mmdb',
        expectedPrefixLength: 120,
        expectedRecord: decoderRecord,
      },
      {
        ip: '200.0.2.1',
        dbFile: 'MaxMind-DB-no-ipv4-search-tree.mmdb',
        expectedPrefixLength: 0,
        expectedRecord: '::0/64',
      },
      {
        ip: '::200.0.2.1',
        dbFile: 'MaxMind-DB-no-ipv4-search-tree.mmdb',
        expectedPrefixLength: 64,
        expectedRecord: '::0/64',
      },
      {
        ip: '0:0:0:0:ffff:ffff:ffff:ffff',
        dbFile: 'MaxMind-DB-no-ipv4-search-tree.mmdb',
        expectedPrefixLength: 64,
        expectedRecord: '::0/64',
      },
      {
        ip: 'ef00::',
        dbFile: 'MaxMind-DB-no-ipv4-search-tree.mmdb',
        expectedPrefixLength: 1,
        expectedRecord: null,
      },
    ];

    for (const test of tests) {
      it(`should test ${test.ip} in ${test.dbFile}`, async () => {
        const geoIp = await maxmind.open(path.join(dataDir, test.dbFile));

        assert.deepStrictEqual(geoIp.getWithPrefixLength(test.ip), [
          test.expectedRecord,
          test.expectedPrefixLength,
        ]);
      });
    }
  });
});
