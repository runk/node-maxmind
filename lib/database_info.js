module.exports = function(info) {
    var _info = info.toString();
    this.getType = function() {
        if (!_info)
            return module.exports.COUNTRY_EDITION;

        // Get the type code from the database info string and then
        // subtract 105 from the value to preserve compatability with
        // databases from April 2003 and earlier.
        var ver = parseInt(_info.substring(4, 7), 10);
        return ver >= 106 ? ver - 105 : ver;
    };
    this.isPremium = function() {
        return _info.indexOf("FREE") < 0;
    };
    this.getDate = function() {
        for (var i = 0; i < _info.length - 9; i++) {
            if (_info.charCodeAt(i) === 0x20)
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
module.exports.CITY_EDITION_REV0        = 6;
module.exports.ORG_EDITION              = 5;
module.exports.ISP_EDITION              = 4;
module.exports.CITY_EDITION_REV1        = 2;
module.exports.REGION_EDITION_REV1      = 3;
module.exports.PROXY_EDITION            = 8;
module.exports.ASNUM_EDITION            = 9;
module.exports.NETSPEED_EDITION         = 10;
module.exports.DOMAIN_EDITION           = 11;
module.exports.COUNTRY_EDITION_V6       = 12;
module.exports.LOCATIONA_EDITION        = 13;
module.exports.ACCURACYRADIUS_EDITION   = 14;
module.exports.CITYCONFIDENCE_EDITION   = 15; /* unsupported */
module.exports.CITYCONFIDENCEDIST_EDITION = 16; /* unsupported */
module.exports.LARGE_COUNTRY_EDITION    = 17;
module.exports.LARGE_COUNTRY_EDITION_V6 = 18;
module.exports.CITYCONFIDENCEDIST_ISP_ORG_EDITION = 19; /* unsued, but gaps are not allowed */
module.exports.CCM_COUNTRY_EDITION      = 20; /* unsued, but gaps are not allowed */
module.exports.ASNUM_EDITION_V6         = 21;
module.exports.ISP_EDITION_V6           = 22;
module.exports.ORG_EDITION_V6           = 23;
module.exports.DOMAIN_EDITION_V6        = 24;
module.exports.LOCATIONA_EDITION_V6     = 25;
module.exports.REGISTRAR_EDITION        = 26;
module.exports.REGISTRAR_EDITION_V6     = 27;
module.exports.USERTYPE_EDITION         = 28;
module.exports.USERTYPE_EDITION_V6      = 29;
module.exports.CITY_EDITION_REV1_V6     = 30;
module.exports.CITY_EDITION_REV0_V6     = 31;
module.exports.NETSPEED_EDITION_REV1    = 32;
module.exports.NETSPEED_EDITION_REV1_V6 = 33;
module.exports.COUNTRYCONF_EDITION      = 34;
module.exports.CITYCONF_EDITION         = 35;
module.exports.REGIONCONF_EDITION       = 36;
module.exports.POSTALCONF_EDITION       = 37;
module.exports.ACCURACYRADIUS_EDITION_V6 = 38;
