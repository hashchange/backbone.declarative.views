;( function ( root, factory ) {
    if ( typeof exports === 'object' ) {

        var underscore = require( 'underscore' );
        var backbone = require( 'backbone' );
        var jquery = require( 'jquery' );

        module.exports = factory( underscore, backbone, jquery );

    } else if ( typeof define === 'function' && define.amd ) {

        define( ['underscore', 'backbone', 'jquery'], factory );

    }
}( this, function ( _, Backbone, jQuery ) {
    "option strict";

    // @include backbone.declarative.views.js

} ));

