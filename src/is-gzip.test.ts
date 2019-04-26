import { strict as assert } from 'assert';
import isGzip from './is-gzip';

describe('lib/is-gzip', () => {
  it('should return false for short buffers', () => {
    assert.equal(isGzip(Buffer.from([1, 2])), false);
  });

  it('should return false for string buffer', () => {
    assert.equal(isGzip(Buffer.from('kraken')), false);
  });

  it('should return false for string buffer', () => {
    // gzipped "kraken" string
    // shell: `echo "kraken" | gzip | base64`
    const buffer = Buffer.from(
      'H4sIAGBDv1gAA8suSsxOzeMCAKjj9U8HAAAA',
      'base64'
    );
    assert.equal(isGzip(buffer), true);
  });
});
