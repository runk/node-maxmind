import { strict as assert } from 'assert';
import ip from './ip';

describe('lib/ip', () => {
  describe('parse()', () => {
    describe('ipv4', () => {
      it('should successfully parse v4', () => {
        assert.deepStrictEqual(ip.parse('127.0.0.1'), [0x7f, 0x00, 0x00, 0x01]);
        assert.deepStrictEqual(ip.parse('10.10.200.59'), [0x0a, 0x0a, 0xc8, 0x3b]);
      });
    });

    describe('ipv6', () => {
      it('should parse complete address', () => {
        assert.deepStrictEqual(ip.parse('2001:0db8:85a3:0042:1000:8a2e:0370:7334'), [
          0x20,
          0x1,
          0xd,
          0xb8,
          0x85,
          0xa3,
          0,
          0x42,
          0x10,
          0,
          0x8a,
          0x2e,
          0x03,
          0x70,
          0x73,
          0x34,
        ]);
        assert.deepStrictEqual(ip.parse('2001:0db8:85a3:0000:0000:8a2e:0370:7334'), [
          0x20,
          0x01,
          0x0d,
          0xb8,
          0x85,
          0xa3,
          0x00,
          0x00,
          0x00,
          0x00,
          0x8a,
          0x2e,
          0x03,
          0x70,
          0x73,
          0x34,
        ]);
      });

      it('should parse two-part address', () => {
        assert.deepStrictEqual(ip.parse('2001:4860:0:1001::3004:ef68'), [
          0x20,
          0x01,
          0x48,
          0x60,
          0,
          0,
          0x10,
          0x01,
          0,
          0,
          0,
          0,
          0x30,
          0x04,
          0xef,
          0x68,
        ]);
        assert.deepStrictEqual(ip.parse('2001:db8:85a3::8a2e:370:7334'), [
          0x20,
          0x01,
          0x0d,
          0xb8,
          0x85,
          0xa3,
          0x00,
          0x00,
          0x00,
          0x00,
          0x8a,
          0x2e,
          0x03,
          0x70,
          0x73,
          0x34,
        ]);
      });

      it('should parse `::` in the end of address', () => {
        const expected = [
          0x20,
          0x01,
          0x02,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ];
        assert.deepStrictEqual(ip.parse('2001:200::'), expected);
        assert.deepStrictEqual(
          ip.parse('2001:0200:0000:0000:0000:0000:0000:0000'),
          expected
        );
      });

      it('should parse ipv4 with `::ffff`', () => {
        const expected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 1, 2, 254, 216];
        assert.deepStrictEqual(ip.parse('::ffff:1.2.254.216'), expected);
        assert.deepStrictEqual(ip.parse('::ffff:0102:fed8'), expected);
        assert.deepStrictEqual(ip.parse('::ffff:102:fed8'), expected);
        assert.deepStrictEqual(
          ip.parse('0000:0000:0000:0000:0000:ffff:0102:fed8'),
          expected
        );
        assert.deepStrictEqual(
          ip.parse('0000:0000:0000:0000:0000:ffff:102:fed8'),
          expected
        );
      });

      it('should parse ipv4 with `::`', () => {
        const expected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 64, 17, 254, 216];
        assert.deepStrictEqual(ip.parse('::64.17.254.216'), expected);
        assert.deepStrictEqual(ip.parse('::4011:fed8'), expected);
        assert.deepStrictEqual(
          ip.parse('0000:0000:0000:0000:0000:0000:4011:fed8'),
          expected
        );
      });
    });
  });

  describe('bitAt()', () => {
    it('should return correct bit for given offset', () => {
      const address = Buffer.from([0x0a, 0x0a, 0xc8, 0x3b]);
      assert.strictEqual(ip.bitAt(address, 1), 0);
      assert.strictEqual(ip.bitAt(address, 10), 0);
      assert.strictEqual(ip.bitAt(address, 23), 0);
      assert.strictEqual(ip.bitAt(address, 31), 1);
      assert.strictEqual(ip.bitAt(address, 999), 0);
    });
  });

  describe('validate()', () => {
    it('should work fine for IPv4', () => {
      assert.strictEqual(ip.validate('64.4.4.4'), true);
      assert.strictEqual(ip.validate('64.4.4.boom!'), false);
      // @ts-ignore
      assert.strictEqual(ip.validate(undefined), false);
      assert.strictEqual(ip.validate('kraken'), false);
    });

    it('should work fine for IPv6', () => {
      assert.strictEqual(ip.validate('2001:4860:0:1001::3004:ef68'), true);
      assert.strictEqual(ip.validate('::64.17.254.216'), true);
      assert.strictEqual(ip.validate('2001:4860:0:1001::3004:boom!'), false);
    });
  });
});
