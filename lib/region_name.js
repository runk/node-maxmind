
var _data = require('./region_name_data');

module.exports = function(countryCode, regionCode) {

    var regionCode2 = -1;

    if (regionCode == null)
        return null;

    if (regionCode == "")
        return null;

    // not quite sure that those calculations really required,
    // since we use the same in the generator script
    if (((regionCode.charCodeAt(0) >= 48 ) && ( regionCode.charCodeAt(0) < ( 48 + 10 ))) &&
        ((regionCode.charCodeAt(1) >= 48 ) && ( regionCode.charCodeAt(1) < ( 48 + 10 )))
    ) {
        // only numbers, that shorten the large switch statements
        regionCode2 = (regionCode.charCodeAt(0)- 48) * 10 + regionCode.charCodeAt(1) - 48;
    } else if ((
        ((regionCode.charCodeAt(0) >= 65) && (regionCode.charCodeAt(0) < (65 + 26))) ||
        ((regionCode.charCodeAt(0) >= 48) && (regionCode.charCodeAt(0) < (48 + 10)))
      ) && (
        ((regionCode.charCodeAt(1) >= 65) && (regionCode.charCodeAt(1) < (65 + 26))) ||
        ((regionCode.charCodeAt(1) >= 48) && (regionCode.charCodeAt(1) < (48 + 10)))
      )
    ) {
        regionCode2 = (regionCode.charCodeAt(0) - 48) * (65 + 26 - 48) + regionCode.charCodeAt(1) - 48 + 100;
    }

    if (regionCode2 == -1)
        return null;

    return _data[countryCode][regionCode2];
};