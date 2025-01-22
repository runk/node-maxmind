import assert from 'assert';
import { Reader, Response } from 'mmdb-lib';
import { lru } from 'tiny-lru';
import fs from './fs';
import ip from './ip';
import isGzip from './is-gzip';
import utils from './utils';

const LARGE_FILE_THRESHOLD = 512 * 1024 * 1024;
const STREAM_WATERMARK = 8 * 1024 * 1024;

type Callback = () => void;

export interface OpenOpts {
  cache?: {
    max: number;
  };
  watchForUpdates?: boolean;
  watchForUpdatesNonPersistent?: boolean;
  watchForUpdatesHook?: Callback;
}

/**
 * Read large file in chunks.
 *
 * Reason it's not used for all file sizes is that it's slower than fs.readFile and uses
 * a bit more memory due to the buffer operations.
 *
 * Node seems to have a limit of 2GB for fs.readFileSync, so we need to use streams for
 * larger files.
 *
 * @param filepath
 * @param size
 * @returns
 */
const readLargeFile = async (filepath: string, size: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    let buffer = Buffer.allocUnsafe(size);
    let offset = 0;
    const stream = fs.createReadStream(filepath, {
      highWaterMark: STREAM_WATERMARK,
    });

    stream.on('data', (chunk: Buffer) => {
      chunk.copy(buffer, offset);
      offset += chunk.length;
    });

    stream.on('end', () => {
      stream.close();
      resolve(buffer);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });

const readFile = async (filepath: string): Promise<Buffer> => {
  const fstat = await fs.stat(filepath);
  return fstat.size < LARGE_FILE_THRESHOLD
    ? fs.readFile(filepath)
    : readLargeFile(filepath, fstat.size);
};

export const open = async <T extends Response>(
  filepath: string,
  opts?: OpenOpts,
  cb?: Callback
): Promise<Reader<T>> => {
  assert(!cb, utils.legacyErrorMessage);

  const database = await readFile(filepath);

  if (isGzip(database)) {
    throw new Error(
      'Looks like you are passing in a file in gzip format, please use mmdb database instead.'
    );
  }

  const cache = lru(opts?.cache?.max || 10_000);
  const reader = new Reader<T>(database, { cache });

  if (opts && !!opts.watchForUpdates) {
    if (
      opts.watchForUpdatesHook &&
      typeof opts.watchForUpdatesHook !== 'function'
    ) {
      throw new Error('opts.watchForUpdatesHook should be a function');
    }
    const watcherOptions = {
      persistent: opts.watchForUpdatesNonPersistent !== true,
    };

    fs.watchFile(filepath, watcherOptions, async () => {
      // When database file is being replaced,
      // it could be removed for a fraction of a second.
      const waitExists = async () => {
        for (let i = 0; i < 3; i++) {
          if (fs.existsSync(filepath)) {
            return true;
          }

          await new Promise((a) => setTimeout(a, 500));
        }

        return false;
      };
      if (!(await waitExists())) {
        return;
      }
      const updatedDatabase = await readFile(filepath);
      cache.clear();
      reader.load(updatedDatabase);
      if (opts.watchForUpdatesHook) {
        opts.watchForUpdatesHook();
      }
    });
  }

  return reader;
};

export const openSync = () => {
  throw new Error(utils.legacyErrorMessage);
};

export const init = () => {
  throw new Error(utils.legacyErrorMessage);
};

export const validate = ip.validate;

export * from 'mmdb-lib';

export default {
  init,
  open,
  openSync,
  validate: ip.validate,
};

export { Reader };
