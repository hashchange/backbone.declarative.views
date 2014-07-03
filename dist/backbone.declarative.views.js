// Backbone.Declarative.Views, v0.1.1
// Copyright (c)2014 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.declarative.views

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