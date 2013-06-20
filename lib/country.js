/**
 * Creates a new Country.
 *
 * @param code the country code.
 * @param name the country name.
 */
module.exports = function(code, name) {

    this.code = code;
    this.name = name;

    /**
     * Returns the ISO two-letter country code of this country.
     *
     * @return the country code.
     */
    this.getCode = function() {
        return this.code;
    }

    /**
     * Returns the name of this country.
     *
     * @return the country name.
     */
    this.getName = function() {
        return this.name;
    }
};
