var Reader = require('./lib/reader.js');

module.exports = MaxmindDBReader;

function MaxmindDBReader() {
  // allow creation without 'new' keyword
  if (!(this instanceof MaxmindDBReader))
    return new MaxmindDBReader();
}


MaxmindDBReader.open = function(database) {
  var mmdbreader = MaxmindDBReader();
  mmdbreader.reader = Reader.open(database);
  return mmdbreader;
};


MaxmindDBReader.prototype.getGeoData = function(ipAddress) {
  return this.reader.get(ipAddress);
};

MaxmindDBReader.prototype.getMetadata = function() {
  return this.reader.getMetadata();
};
