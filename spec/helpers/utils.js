/**
 * Transforms a HTML5 data-* attributes hash to a hash of Javascript properties.
 *
 * - The key names are changed. The "data-" prefix is dropped, and hyphen notation is changed to camel case.
 * - Some values are changed. If a data attribute is used to store an object, it has been converted to a JSON string.
 *   So JSON-string values are converted back into actual objects.
 *
 * Example:
 *     {
 *         "data-my-prop": "some value",
 *         "data-hash":  '{ "foo": "nested foo", "bar": "nested bar" }'
 *     }
 * =>
 *     {
 *         myProp: "some value",
 *         hash:   { foo: "nested foo", bar: "nested bar" }
 *     }
 *
 * @param   {Object} dataAttributesHash
 * @returns {Object}
 */
function dataAttributesToProperties ( dataAttributesHash ) {
    var transformed = {};

    $.each( dataAttributesHash, function ( key, value ) {
        // Drop the "data-" prefix, then convert to camelCase
        key = key
            .replace( /^data-/, "" )
            .replace( /-([a-z])/gi, function ( $0, $1 ) {
                return $1.toUpperCase();
            } );

        try {
            value = $.parseJSON( value );
        } catch ( err ) {}

        transformed[key] = value;
    } );

    return transformed;
}
