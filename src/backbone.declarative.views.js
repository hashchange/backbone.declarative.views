;( function ( Backbone, _ ) {
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

}( Backbone, _ ));