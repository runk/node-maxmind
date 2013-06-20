
module.exports = function(info) {
    var _info = info.toString();
    this.getType = function() {
        if (_info == null || _info == "") {
            return module.exports.COUNTRY_EDITION;
        } else {
            // Get the type code from the database info string and then
            // subtract 105 from the value to preserve compatability with
            // databases from April 2003 and earlier.
            return parseInt(_info.substring(4, 7)) - 105;
        }
    };
    this.isPremium = function() {
        return _info.indexOf("FREE") < 0;
    };
    this.getDate = function() {
        for (var i = 0; i < _info.length - 9; i++) {
            if (_info.charCodeAt(i) == 0x20)
                return new Date(
                    _info.substring(i+1, i+9)
                         .replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
                );
        }
    };
    this.toString = function() {
        return _info;
    };
};

module.exports.COUNTRY_EDITION          = 1;
module.exports.REGION_EDITION_REV0      = 7;
module.exports.REGION_EDITION_REV1      = 3;
module.exports.CITY_EDITION_REV0        = 6;
module.exports.CITY_EDITION_REV1        = 2;
module.exports.ORG_EDITION              = 5;
module.exports.ISP_EDITION              = 4;
module.exports.PROXY_EDITION            = 8;
module.exports.ASNUM_EDITION            = 9;
module.exports.NETSPEED_EDITION         = 10;
module.exports.DOMAIN_EDITION           = 11;
module.exports.COUNTRY_EDITION_V6       = 12;
module.exports.ASNUM_EDITION_V6         = 21;
module.exports.ISP_EDITION_V6           = 22;
module.exports.ORG_EDITION_V6           = 23;
module.exports.DOMAIN_EDITION_V6        = 24;
module.exports.CITY_EDITION_REV1_V6     = 30;
module.exports.CITY_EDITION_REV0_V6     = 31;
module.exports.NETSPEED_EDITION_REV1    = 32;
module.exports.NETSPEED_EDITION_REV1_V6 = 33;
