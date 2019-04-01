import fs from 'fs';
import util from 'util';

export default {
  readFile: util.promisify(fs.readFile),
  readFileSync: fs.readFileSync,
  watch: fs.watch,
};
