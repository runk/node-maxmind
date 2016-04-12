'use strict';

var Reader = require('./lib/Reader.js');

module.exports = MaxmindDBReader;

function MaxmindDBReader() {
  // allow creation without 'new' keyword
  if (!(this instanceof MaxmindDBReader))
    return new MaxmindDBReader();
}

MaxmindDBReader.open = function openAsync(database, callback) {
    Reader.open(database, function(err, reader){
        if(err){
            return callback(err);
        }
        var mmdbreader = MaxmindDBReader();
        mmdbreader.reader = reader;
        callback(null,mmdbreader);
    });
};

MaxmindDBReader.openSync = function openSync(database) {
    var mmdbreader = MaxmindDBReader();
    mmdbreader.reader = Reader.openSync(database);
    return mmdbreader;
};


MaxmindDBReader.prototype.getGeoDataSync = function getGeoDataSync(ipAddress) {
    return this.reader.getSync(ipAddress);
};

MaxmindDBReader.prototype.getDatabaseMetadata = function getDatabaseMetadata() {
    return this.reader.getMetadata();
};
