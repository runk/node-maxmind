var _data = require('./region_name_data');

module.exports = function(countryCode, regionCode) {

    var regionCode2;

    if (!regionCode)
        return null;

    // not quite sure that those calculations really required,
    // since we use the same in the generator script
    var firstChar = regionCode.charCodeAt(0),
        secondChar = regionCode.charCodeAt(1);

    if (
        (firstChar >= 48 && firstChar < 48 + 10) && (secondChar >= 48 && secondChar < 48 + 10)
    ) {
        // only numbers, that shorten the large switch statements
        regionCode2 = (firstChar - 48) * 10 + secondChar - 48;
    } else if ((
        (firstChar >= 65 && firstChar < 65 + 26) || (firstChar >= 48 && firstChar < 48 + 10)
      ) && (
        (secondChar >= 65 && secondChar < 65 + 26) || (secondChar >= 48 && secondChar < 48 + 10)
      )
    ) {
        regionCode2 = (firstChar - 48) * (65 + 26 - 48) + secondChar - 48 + 100;
    }

    if (!regionCode2)
        return null;

    return _data[countryCode][regionCode2];
};
