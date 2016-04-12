const EARTH_DIAMETER = 2 * 6378.2;
const PI = 3.14159265;
const RAD_CONVERT = PI / 180;

module.exports = function() {
  this.countryCode = null;
  this.countryName = null;
  this.region = null;
  this.city = null;
  this.postalCode = null;
  this.latitude = null;
  this.longitude = null;
  this.dmaCode = null;
  this.areaCode = null;
  this.metroCode = null;

  this.distance = function(loc) {
    var temp;

    var lat1 = this.latitude;
    var lon1 = this.longitude;
    var lat2 = loc.latitude;
    var lon2 = loc.longitude;

    // convert degrees to radians
    lat1 *= RAD_CONVERT;
    lat2 *= RAD_CONVERT;

    // find the deltas
    var deltaLat = lat2 - lat1;
    var deltaLon = (lon2 - lon1) * RAD_CONVERT;

    // Find the great circle distance
    temp = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);
    return Math.round(EARTH_DIAMETER * Math.atan2(Math.sqrt(temp), Math.sqrt(1 - temp)) * 1e6) / 1e6;
  };
};
