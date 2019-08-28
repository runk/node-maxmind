import assert from 'assert';
import fs from 'fs';
import path from 'path';
import Reader from './reader';

describe('reader', () => {
  const dataDir = path.join(__dirname, '../test/data/test-data');
  const read = (dir: string, filepath: string): Buffer =>
    fs.readFileSync(path.join(dir, filepath));

  describe('findAddressInTree()', () => {
    it('should work for most basic case', () => {
      const reader = new Reader(read(dataDir, 'GeoIP2-City-Test.mmdb'));
      assert.equal(reader.findAddressInTree('1.1.1.1'), null);
    });

    it('should return correct value: city database', () => {
      const reader = new Reader(read(dataDir, 'GeoIP2-City-Test.mmdb'));
      assert.equal(reader.findAddressInTree('1.1.1.1'), null);
      assert.equal(reader.findAddressInTree('175.16.199.1'), 3042);
      assert.equal(reader.findAddressInTree('175.16.199.88'), 3042);
      assert.equal(reader.findAddressInTree('175.16.199.255'), 3042);
      assert.equal(reader.findAddressInTree('::175.16.199.255'), 3042);
      assert.equal(reader.findAddressInTree('::ffff:175.16.199.255'), 3042);
      assert.equal(reader.findAddressInTree('2a02:cf40:ffff::'), 4735);
      assert.equal(reader.findAddressInTree('2a02:cf47:0000::'), 4735);
      assert.equal(
        reader.findAddressInTree('2a02:cf47:0000:fff0:ffff::'),
        4735
      );
      assert.equal(reader.findAddressInTree('2a02:cf48:0000::'), null);
    });

    it('should return correct value: string entries', () => {
      const reader = new Reader(
        read(dataDir, 'MaxMind-DB-string-value-entries.mmdb')
      );
      assert.equal(reader.findAddressInTree('1.1.1.1'), 98);
      assert.equal(reader.findAddressInTree('1.1.1.2'), 87);
      assert.equal(reader.findAddressInTree('175.2.1.1'), null);
    });

    describe('various record sizes and ip versions', () => {
      const ips = {
        v4: {
          '1.1.1.1': 102,
          '1.1.1.2': 90,
          '1.1.1.32': 114,
          '1.1.1.33': null,
        },
        v6: {
          '::1:ffff:fffa': null,
          '::1:ffff:ffff': 176,
          '::2:0000:0000': 194,
          '::2:0000:0060': null,
        },
        mix: {
          '1.1.1.1': 315,
          '1.1.1.2': 301,
          '1.1.1.32': 329,
          '1.1.1.33': null,
          '::1:ffff:fffa': null,
          '::1:ffff:ffff': 344,
          '::2:0000:0000': 362,
          '::2:0000:0060': null,
        },
      };

      interface Scenarios {
        [key: string]: Record<string, number | null>;
      }

      const scenarios: Scenarios = {
        'MaxMind-DB-test-ipv4-24.mmdb': ips.v4,
        'MaxMind-DB-test-ipv4-28.mmdb': ips.v4,
        'MaxMind-DB-test-ipv4-32.mmdb': ips.v4,
        'MaxMind-DB-test-ipv6-24.mmdb': ips.v6,
        'MaxMind-DB-test-ipv6-28.mmdb': ips.v6,
        'MaxMind-DB-test-ipv6-32.mmdb': ips.v6,
        'MaxMind-DB-test-mixed-24.mmdb': ips.mix,
        'MaxMind-DB-test-mixed-28.mmdb': ips.mix,
        'MaxMind-DB-test-mixed-32.mmdb': ips.mix,
      };

      for (const item in scenarios) {
        it('should return correct value: ' + item, () => {
          const reader = new Reader(read(dataDir, '' + item));
          const list = scenarios[item];
          for (const ip in list) {
            assert.equal(reader.findAddressInTree(ip), list[ip], 'IP: ' + ip);
          }
        });
      }
    });

    describe('broken files and search trees', () => {
      it('should behave fine when there is no  ipv4 search tree', () => {
        const reader = new Reader(
          read(dataDir, 'MaxMind-DB-no-ipv4-search-tree.mmdb')
        );
        assert.equal(reader.findAddressInTree('::1:ffff:ffff'), 80);
        assert.equal(reader.findAddressInTree('1.1.1.1'), 80);
      });

      it('should behave fine when search tree is broken', () => {
        // TODO: find out in what way the file is broken
        const reader = new Reader(
          read(dataDir, 'MaxMind-DB-test-broken-search-tree-24.mmdb')
        );
        assert.equal(reader.findAddressInTree('1.1.1.1'), 102);
        assert.equal(reader.findAddressInTree('1.1.1.2'), 90);
      });
    });

    describe('invalid database format', () => {
      it('should provide meaningful message when one tries to use legacy db', () => {
        assert.throws(() => {
          // tslint:disable-next-line: no-unused-expression
          new Reader(
            read(path.join(__dirname, '../test/databases'), 'legacy.dat')
          );
        }, /Maxmind v2 module has changed API/);
      });

      it('should provide meaningful message when one tries to use unknown format', () => {
        assert.throws(() => {
          // tslint:disable-next-line: no-unused-expression
          new Reader(
            read(path.join(__dirname, '../test/databases'), 'broken.dat')
          );
        }, /Cannot parse binary database/);
      });
    });
  });
});
