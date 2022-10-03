import assert from 'assert';
import lru from 'tiny-lru';
import { Reader, Response } from 'mmdb-lib';
import fs from './fs';
import ip from './ip';
import isGzip from './is-gzip';
import utils from './utils';

type Callback = () => void;

export interface OpenOpts {
  cache?: {
    max: number;
  };
  watchForUpdates?: boolean;
  watchForUpdatesNonPersistent?: boolean;
  watchForUpdatesHook?: Callback;
}

export const open = async <T extends Response>(
  filepath: string,
  opts?: OpenOpts,
  cb?: Callback
): Promise<Reader<T>> => {
  assert(!cb, utils.legacyErrorMessage);

  const database = await fs.readFile(filepath);

  if (isGzip(database)) {
    throw new Error(
      'Looks like you are passing in a file in gzip format, please use mmdb database instead.'
    );
  }

  const cache = lru((opts && opts.cache && opts.cache.max) || 6000);
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
      const updatedDatabase = await fs.readFile(filepath);
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
