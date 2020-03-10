import fs from 'fs';
import util from 'util';

export default {
  existsSync: fs.existsSync,
  readFile: util.promisify(fs.readFile),
  readFileSync: fs.readFileSync,
  watch: fs.watch,
};
