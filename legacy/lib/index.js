const DB_FORMAT_VER_1          = 1;
const DB_FORMAT_VER_2          = 2;


exports.detectVersion = function (file) {

  var delim = new Buffer(3);

  // Format ver 1
  file.seek(file.length() - 3);
  for (i = 0; i < STRUCTURE_INFO_MAX_SIZE; i++) {
    file.readFully(delim);
    if (delim[0] === 255 && delim[1] === 255 && delim[2] === 255)
      return DB_FORMAT_VER_1;
    file.seek(file.getFilePointer() - 4);
  }

  // Format ver 2
  var info = '';
  var infoBuffer = new Buffer(1024);

  // Reading data by small chunks of 1024 bytes,
  // looking for start of metadata block. Max metadata block size is 128kb.
  file.seek(file.length());
  for (i = 0; i < 128; i++) {
    file.seek(file.getFilePointer() - 1024);
    file.readFully(infoBuffer);
    info += infoBuffer.toString('binary');
    if (info.indexOf("\xab\xcd\xefMaxMind.com") > -1) {
      return DB_FORMAT_VER_2;
    }
  }

  return 0;
};
