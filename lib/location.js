
const EARTH_DIAMETER = 2 * 6378.2;
const PI = 3.14159265;
const RAD_CONVERT = PI / 180;

function Location() {
    this.countryCode;
    this.countryName;
    this.region;
    this.city;
    this.postalCode;
    this.latitude;
    this.longitude;
    this.dma_code;
    this.area_code;
    this.metro_code;

    this.distance = function(loc) {
        var delta_lat, delta_lon;
        var temp;

        var lat1 = this.latitude;
        var lon1 = this.longitude;
        var lat2 = loc.latitude;
        var lon2 = loc.longitude;

        // convert degrees to radians
        lat1 *= RAD_CONVERT;
        lat2 *= RAD_CONVERT;

        // find the deltas
        delta_lat = lat2 - lat1;
        delta_lon = (lon2 - lon1) * RAD_CONVERT;

        // Find the great circle distance
        temp = Math.pow(Math.sin(delta_lat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(delta_lon/2),2);
        return Math.round(EARTH_DIAMETER * Math.atan2(Math.sqrt(temp),Math.sqrt(1-temp)) * 1e6) / 1e6;
    };
};

module.exports = Location;


