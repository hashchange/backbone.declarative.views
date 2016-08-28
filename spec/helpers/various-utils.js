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
        key = toCamelCase( key.replace( /^data-/, "" ) );

        try {
            value = $.parseJSON( value );
        } catch ( err ) {}

        transformed[key] = value;
    } );

    return transformed;
}

/**
 * Transforms a hash of Javascript properties into a HTML5 data-* attributes hash. Is the inverse function of
 * `dataAttributesToProperties()`.
 *
 * @param   {Object} attributesHash
 * @returns {Object}
 */
function propertiesToDataAttributes ( attributesHash ) {
    var transformed = {};

    $.each( attributesHash, function ( key, value ) {
        // Convert camelCase to dashed notation, then add the "data-" prefix
        key = "data-" + toDashed( key );

        if ( $.isPlainObject( value ) ) value = JSON.stringify( value );

        transformed[key] = value;
    } );

    return transformed;
}

/**
 * Transforms a hash of HTML attributes - e.g., data attributes - into a string.
 *
 * The string has a trailing slash (or newline), but not a leading one. Double quotes are used by default around values,
 * except around JSON strings which have to be enclosed by single quotes.
 *
 * The string can be used to create the HTML of a tag with the given attributes. Data attributes containing a
 * stringified JSON structure are fully supported (simply by using single quotes around attribute values there).
 *
 * The following formatting option are available:
 *
 * - The order of the attributes can be reversed.
 * - Attributes can be separated by newlines instead of spaces.
 * - Redundant whitespace can be inserted around the "=" of each assignment.
 * - Values can be enclosed in single quotes, rather than double quotes, where possible (skipped for values containing a
 *   double quote character).
 *
 * @param   {Object}  attributesHash
 * @param   {Object}  [options]
 * @param   {boolean} [options.reverse=false]
 * @param   {boolean} [options.multiline=false]
 * @param   {string}  [options.extraSpace=""]
 * @param   {boolean} [options.preferSingleQuotes=false]
 * @returns {string}
 */
function attributesHashToString ( attributesHash, options ) {
    var reduce = options && options.reverse ? _.reduceRight : _.reduce,
        separator = options && options.multiline ? "\n" : " ",
        spacing = options && options.extrSpace || "",
        defaultQuote = options && options.preferSingleQuotes ? "'" : '"';

    return reduce( attributesHash, function ( attrString, value, key ) {
        var quote = value.indexOf( '"' ) !== -1 ? "'" :  value.indexOf( "'" ) !== -1 ? '"' : defaultQuote;
        return attrString + key + spacing + "=" + spacing + quote + value + quote + separator;
    }, "" );
}

/**
 * Returns a transformed hash in which all camelCased property names have been replaced by dashed property names. The
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
        transformed[toDashed( key )] = value;
    } );

    return transformed;
}

/**
 * Returns a transformed hash in which all dashed property names have been replaced by camelCased property names. The
 * input hash remains untouched.
 *
 * Property values are not modified.
 *
 * Simple implementation, but good enough for the attribute names we deal with here.
 *
 * Example: { "foo-bar": "what-ever" } => { fooBar: "what-ever" }
 *
 * @param   {Object} hash
 * @returns {Object}
 */
function toCamelCasedProperties ( hash ) {
    var transformed = {};

    _.each( hash, function ( value, key ) {
        transformed[toCamelCase( key )] = value;
    } );

    return transformed;
}

/**
 * Converts a camelCased label into a dashed label.
 *
 * Simple implementation, but good enough for the attribute names we deal with here.
 *
 * @param   {string} label
 * @returns {string}
 */
function toDashed ( label ) {
    return label.replace( /([a-z])([A-Z])/g, function ( $0, $1, $2 ) {
        return $1 + "-" + $2.toLowerCase();
    } );
}

/**
 * Converts a dashed label into a camelCased label.
 *
 * Simple implementation, but good enough for the attribute names we deal with here.
 *
 * @param   {string} label
 * @returns {string}
 */
function toCamelCase ( label ) {
    return label.replace( /-([a-z])/gi, function ( $0, $1 ) {
        return $1.toUpperCase();
    } );
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

/**
 * Checks the Marionette version and returns true if it is less than 3.
 *
 * NB Marionette 1 and 2 don't expose the version, so we look for the version string of Marionette 3 (or above) and
 * negate the result.
 *
 * @returns {boolean}
 */
function isMarionetteLt3 () {
    return !( Backbone.Marionette.VERSION && Backbone.Marionette.VERSION[0] >= 3 );
}

/**
 * Returns the basic Marionette view type: Marionette.ItemView for Marionette 1 and 2, Marionette.View for Marionette 3.
 *
 * @returns {Backbone.Marionette.ItemView|Backbone.Marionette.View}
 */
function getMarionetteView () {
    return isMarionetteLt3() ? Backbone.Marionette.ItemView : Backbone.Marionette.View;
}
