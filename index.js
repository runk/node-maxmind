var Reader = require('./lib/reader');

exports.open = function(database) {
  return new Reader(database);
};
