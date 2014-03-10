var DynBuffer = require('../dyn_buffer');

const MAX_ORG_RECORD_LENGTH = 300;


module.exports = function(db, cseek) {
  var recordBuf,
    pointer = 0,
    byte,
    org = '';

  if (cseek === db.segment)
    return null;

  var recordPointer = cseek + (2 * db.recordLength - 1) * db.segment;

  if (db.opts.memoryCache) {
    recordBuf = new DynBuffer(db.dbbuffer, recordPointer,
      Math.min(db.dbbuffer.length - recordPointer, MAX_ORG_RECORD_LENGTH));
  } else {
    recordBuf = new DynBuffer(new Buffer(MAX_ORG_RECORD_LENGTH), 0, MAX_ORG_RECORD_LENGTH);
    db.file.seek(recordPointer);
    db.file.readFully(recordBuf.source);
  }

  while (true) {
    byte = recordBuf.at(pointer);
    if (byte === 0) break;
    org += String.fromCharCode(byte);
    pointer++;
  }

  return org || null;
};
