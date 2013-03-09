
/**
 * Creates a new Country.
 *
 * @param code the country code.
 * @param name the country name.
 */
function Country(code, name) {

    var _code = code,
        _name = name;

    /**
     * Returns the ISO two-letter country code of this country.
     *
     * @return the country code.
     */
    this.getCode = function() {
        return _code;
    }

    /**
     * Returns the name of this country.
     *
     * @return the country name.
     */
    this.getName = function() {
        return _name;
    }
}

module.exports = Country;