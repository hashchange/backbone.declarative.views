;( function ( root, factory ) {
    "use strict";

    if ( typeof exports === 'object' ) {

        module.exports = factory(
            require( 'underscore' ),
            require( 'backbone' ),
            require( 'backbone.declarative.views' )
        );

    } else if ( typeof define === 'function' && define.amd ) {

        define( [
            'underscore',
            'backbone',
            'backbone.declarative.views'
        ], factory );

    }
}( this, function ( _, Backbone ) {
    "use strict";

    var $ = Backbone.$;
    
    Backbone.DeclarativeViews.defaults.hasInlineEl = function ( $templateContainer ) {
        return $templateContainer.data( "el-definition" ) === "inline";
    };
    
    Backbone.DeclarativeViews.defaults.replaceOriginalTemplates = false;

    Backbone.DeclarativeViews.defaults.loadTemplate = function ( templateProperty ) {
        var $finalContainer, className, id,
            $templateContainer = $( templateProperty ),
            hasInlineEl = Backbone.DeclarativeViews.custom.hasInlineEl || Backbone.DeclarativeViews.defaults.hasInlineEl,
            replaceTemplateContainer = Backbone.DeclarativeViews.custom.replaceOriginalTemplates || Backbone.DeclarativeViews.defaults.replaceOriginalTemplates;

        if ( hasInlineEl( $templateContainer ) ) {

            $finalContainer = convertContainer( $templateContainer );

            if ( replaceTemplateContainer ) {

                className = $.trim( $templateContainer.attr( "class" ) );
                id = $.trim( $templateContainer.attr( "id" ) );
                if ( className ) $finalContainer.addClass( className );
                if ( id ) $finalContainer.attr( "id", id );

                $templateContainer.replaceWith( $finalContainer );

            }

        } else {
            $finalContainer = $templateContainer;
        }

        return  $finalContainer;
    };

    function convertContainer ( $templateContainer ) {

        var templateText = $templateContainer.html(),
            $template = $( $.trim( templateText ) ).filter( function() {
                // Strip out top-level text nodes and comments
                var nodeType = this.nodeType;
                return nodeType !== 3 && nodeType !== 8;
            } ),

            templateContent = _.unescape( $template.html() ),

            $converted = $( "<script />" ).attr( "type", "text/x-template" ).text( templateContent ),

            tagName = $template.prop("tagName").toLowerCase(),
            className = $.trim( $template.attr( "class" ) ),
            id = $.trim( $template.attr( "id" ) ),
            otherAttrs = {};

        _.each( $template[0].attributes, function ( attrNode ) {
            var name = attrNode.nodeName,
                value = attrNode.nodeValue,
                include = value && name !== "class" && name !== "id";

            if ( include ) otherAttrs[attrNode.nodeName] = value;
        } );

        if ( tagName !== "div" ) $converted.attr( "data-tag-name", tagName );
        if ( className ) $converted.attr( "data-class-name", className );
        if ( id ) $converted.attr( "data-id", id );
        if ( _.size( otherAttrs ) ) $converted.attr( "data-attributes", JSON.stringify( otherAttrs ) );

        return $converted;

    }

} ));

