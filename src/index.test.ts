import assert from 'assert';
import path from 'path';
import sinon, { SinonSpy } from 'sinon';
import fs from './fs';
import maxmind from './index';
import { CityResponse } from './reader/response';

const nah = () => Promise.reject(new Error('Should not happen'));

describe('index', () => {
  const dataDir = path.join(__dirname, '../test/data/test-data');
  const dbPath = path.join(dataDir, 'GeoIP2-City-Test.mmdb');

  let sandbox: sinon.SinonSandbox;
  let watchHandler: () => void;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // @ts-ignore
    sandbox.stub(fs, 'watch').callsFake((paramA, paramB, cb) => {
      watchHandler = cb;
    });
    sandbox.spy(fs, 'readFile');
    sandbox.spy(fs, 'readFileSync');
  });
  afterEach(() => {
    sandbox.restore();
  });

  describe('validate()', () => {
    it('should work fine for both IPv4 and IPv6', () => {
      assert.strictEqual(maxmind.validate('64.4.4.4'), true);
      assert.strictEqual(maxmind.validate('2001:4860:0:1001::3004:ef68'), true);
      assert.strictEqual(maxmind.validate('whhaaaazza'), false);
    });
  });

  describe('init()', () => {
    it('should fail when someone tries to use legacy api', () => {
      assert.throws(() => {
        maxmind.init();
      }, /Maxmind v2 module has changed API/);
    });
  });

  describe('open()', () => {
    it('should work with most basic usage', async () => {
      const lookup = await maxmind.open<CityResponse>(dbPath);
      assert(lookup.get('2001:230::'));
    });

    it('should successfully handle database, with opts', async () => {
      const options = { cache: { max: 1000 }, watchForUpdates: true };
      const lookup = await maxmind.open(dbPath, options);
      assert(lookup.get('2001:230::'));
      assert((fs.watch as SinonSpy).calledOnce);
      assert((fs.readFile as SinonSpy).calledOnce);
    });

    it('should work with auto updates', async () => {
      const options = { watchForUpdates: true };
      const lookup = await maxmind.open(dbPath, options);
      assert(lookup.get('2001:230::'));
      assert((fs.watch as SinonSpy).calledOnce);
      assert((fs.readFile as SinonSpy).calledOnce);
      watchHandler();
      assert((fs.readFile as SinonSpy).calledTwice);
    });

    it('should work with auto updates and call specified hook', async () => {
      const hook = sinon.spy();
      const options = {
        watchForUpdates: true,
        watchForUpdatesHook: hook,
        watchForUpdatesNonPersistent: false,
      };
      const lookup = await maxmind.open(dbPath, options);
      assert(lookup.get('2001:230::'));
      assert(hook.notCalled);
      await watchHandler();
      assert(hook.calledOnce);
    });

    it('should successfully handle errors while opening a db', async () => {
      await maxmind
        .open('/foo/bar')
        .then(nah)
        .catch((err) => assert.strictEqual(err.code, 'ENOENT'));
    });

    it('should throw an error when callback provided', async () => {
      await maxmind
        .open(dbPath, {}, () => true)
        .then(nah)
        .catch((err) =>
          assert(/Maxmind v2 module has changed API/.test(err.message))
        );
    });

    it('should return an error when gzip file attempted', async () => {
      const badPath = path.join(
        __dirname,
        '../test/databases/GeoIP2-City-Test.mmdb.gz'
      );
      await maxmind
        .open(badPath)
        .then(nah)
        .catch((err) =>
          assert.strictEqual(
            err.message,
            'Looks like you are passing in a file in gzip format, please use mmdb database instead.'
          )
        );
    });

    // it('should check for an error when cannot read database on update', async () => {
    //   var counter = 0;
    //   var cb = function(err, reader) {
    //     // Indeed couter is kinda gross.
    //     switch (counter++) {
    //       case 0:
    //         assert.strictEqual(err, null);
    //         assert(reader instanceof Reader);
    //         assert(fs.readFile.calledOnce);
    //         fs.readFile.restore();
    //         sandbox.stub(fs, 'readFile').callsFake(function(path, cb) {
    //           cb(new Error('Crazy shit'));
    //         });
    //         watchHandler();
    //         break;

    //       case 1:
    //         assert.strictEqual(err.message, 'Crazy shit');
    //         done();
    //         break;

    //       default:
    //         done(new Error('Only two calls should happen'));
    //     }
    //   };
    //   await maxmind.open(dbPath, { watchForUpdates: true }, cb);
    // });

    it('should handle reader errors', async () => {
      await maxmind
        .open(path.join(__dirname, '../test/databases/broken.dat'), {})
        .then(nah)
        .catch((err) => {
          assert(/Cannot parse binary database/.test(err.message));
        });
    });
  });

  describe('openSync()', () => {
    it('should successfully handle database', () => {
      assert.throws(() => {
        maxmind.openSync();
      }, /Maxmind v2 module has changed API/);
    });
  });
});
