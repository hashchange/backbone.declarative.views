// Backbone.Declarative.Views, v1.0.2
// Copyright (c)2014 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.declarative.views

;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone'
        ], factory );

    }
}( this, function ( _, Backbone ) {
    "use strict";

    ;( function ( Backbone, _ ) {
        "use strict";
    
        var originalConstructor = Backbone.View;
    
        function getTemplateElementFromCache ( view ) {
            var namespace, $template;
    
            view.backboneDeclarativeViews || ( view.backboneDeclarativeViews = {} );
            namespace = view.backboneDeclarativeViews;
    
            if ( !_.has( namespace, "$template" ) ) {
    
                if ( view.template && _.isString( view.template ) ) {
                    $template = Backbone.$( view.template );
                    namespace.$template = $template.length ? $template : undefined;
                } else {
                    namespace.$template = undefined;
                }
    
            }
    
            return namespace.$template;
        }
    
        function getTemplateElement ( view ) {
            var $template = getTemplateElementFromCache( view );
            return $template ? $template : $();
        }
    
        _.extend( Backbone.View.prototype, {
    
            tagName: function () {
                return getTemplateElement( this ).data( "tagName" ) || "div";
            },
    
            className: function () {
                return getTemplateElement( this ).data( "className" ) || undefined;
            },
    
            id: function () {
                return getTemplateElement( this ).data( "id" ) || undefined;
            },
    
            attributes: function () {
                return getTemplateElement( this ).data( "attributes" ) || undefined;
            }
    
        } );
    
        Backbone.View = Backbone.View.extend( {
    
            constructor: function ( options ) {
                if ( options && options.template !== undefined ) this.template = options.template;
                this.backboneDeclarativeViews = {};
                originalConstructor.apply( this, arguments );
            }
    
        } );
    
    }( Backbone, _ ));

} ));

