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

/**
 * Returns a transformed hash in which all camel-cased property names have been replaced by dashed property names. The
 * input hash remains untouched.
 *
 * Property values are not modified.
 *
 * Simple implementation, but good enough for the attribute names we deal with here.
 *
 * Example: { fooBar: "whatEver" } => { "foo-bar": "whatEver" }
 *
 * @param   {Object} hash
 * @returns {Object}
 */
function toDashedProperties ( hash ) {
    var transformed = {};

    _.each( hash, function ( value, key ) {
        var transformedKey = key.replace( /([a-z])([A-Z])/g, function ( $0, $1, $2 ) {
            return $1 + "-" + $2.toLowerCase();
        } );

        transformed[transformedKey] = value;
    } );

    return transformed;
}

/**
 * Returns an array of dashed key names, which are the alternative names for all camel-cased key names in a hash.
 *
 * Simple key names (not camel-cased) are ignored and don't show up in the array.
 *
 * E.g., dashedKeyAlternatives( { foo: "whatever", barBaz: "whatever" } ) returns [ "bar-baz" ].
 *
 * @param   {Object} hash
 * @returns {string[]}
 */
function dashedKeyAlternatives ( hash ) {
    var keys = _.keys( toDashedProperties( hash ) );
    return _.filter( keys, function ( key ) {
            return key.search(/[^-]-[a-z]/) !== -1;
        } );
}

/**
 * Combines various hashes with a shallow _.extend(). Doesn't modify the input hashes.
 *
 * Syntactic sugar only, as a simple way of saying _.extend( {}, hashA, hashB, hashN );
 *
 * @param   {...Object} hashes
 * @returns {Object}
 */
function combine ( hashA, hashB, hashN ) {
    var hashes = _.toArray( arguments );

    return _.extend.apply( undefined, [ {} ].concat( hashes ) );
}
