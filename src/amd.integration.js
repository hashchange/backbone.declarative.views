;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' ),
            require( 'marionette' ),
            require( 'backbone.declarative.views' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone',
            'marionette',
            'backbone.declarative.views'
        ], factory );

    }
}( this, function ( _, Backbone ) {
    "use strict";

    // @include marionette.declarativeviews.integration.js

} ));

