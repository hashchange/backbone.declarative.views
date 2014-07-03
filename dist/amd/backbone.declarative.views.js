// Backbone.Declarative.Views, v0.1.1
// Copyright (c)2014 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.declarative.views

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

    ;( function ( Backbone, _, $ ) {
        "use strict";
    
        var originalConstructor = Backbone.View;
    
        _.extend( Backbone.View.prototype, {
    
            tagName: function () {
                return $( this.template ).data( "tagName" ) || "div";
            },
    
            className: function () {
                return $( this.template ).data( "className" ) || undefined;
            },
    
            id: function () {
                return $( this.template ).data( "id" ) || undefined;
            },
    
            attributes: function () {
                return $( this.template ).data( "attributes" ) || undefined;
            }
    
        } );
    
        Backbone.View = Backbone.View.extend( {
    
            constructor: function ( options ) {
                options || (options = {});
                _.extend( this, _.pick( options, "template" ) );
                originalConstructor.apply( this, arguments );
            }
    
        } );
    
    }( Backbone, _, jQuery ));

} ));

