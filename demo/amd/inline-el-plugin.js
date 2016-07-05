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

    var $ = Backbone.$,
        $document = $( document ),
        pluginNamespace = Backbone.InlineTemplate = {},

        rxOutermostHtmlTagWithContent = /(<\s*[a-zA-Z].*?>)([\s\S]*)(<\s*\/\s*[a-zA-Z]+\s*>)/,
        rxSelfClosingHtmlTag = /<\s*[a-zA-Z].*?\/\s*>/;

    //
    // Initialization
    // --------------

    Backbone.DeclarativeViews.plugins.registerDataAttribute( "el-definition" );
    pluginNamespace.hasInlineEl = _hasInlineEl;
    pluginNamespace.updateOriginalTemplates = false;

    //
    // Template loader
    //----------------

    Backbone.DeclarativeViews.defaults.loadTemplate = function ( templateProperty ) {
        var parsedTemplateData, $resultTemplate,

            hasInlineEl = pluginNamespace.hasInlineEl || _hasInlineEl,
            updateTemplateContainer = pluginNamespace.updateOriginalTemplates,

            $inputTemplate = $( templateProperty );

        if ( !hasInlineEl( $inputTemplate ) ) {

            // No inline el definition. Just return the template as is.
            $resultTemplate = $inputTemplate;

        } else {

            parsedTemplateData = _parseTemplateHtml( $inputTemplate.html() );

            if ( updateTemplateContainer ) {
                // For updating the template container, it has to be a node in the DOM. Throw an error if it has been
                // passed in as a raw HTML string.
                if ( !existsInDOM( templateProperty )  ) throw new Backbone.DeclarativeViews.TemplateError( "Backbone.Inline.Template: Can't update the template container because it doesn't exist in the DOM. The template property must be a valid selector (and not, for instance, a raw HTML string). Instead, we got \"" + templateProperty + '"' );

                $resultTemplate = $inputTemplate;
            } else {
                // No updating of the input template. Create a new template node which will stay out of the DOM, but is
                // passed to the cache.
                $resultTemplate = $( "<script />" ).attr( "type", "text/x-template" );
            }

            _mapElementToDataAttributes ( parsedTemplateData.$elSample, $resultTemplate );
            $resultTemplate.empty().text( parsedTemplateData.templateContent );

        }

        return  $resultTemplate;
    };

    /**
     * Checks if a template is marked as having an inline `el`. Is also exposed as Backbone.InlineTemplate.hasInlineEl().
     *
     * By default, a template is recognized as having an inline `el` when the container has the following data attribute:
     * `data-el-definition: "inline"`.
     *
     * The check can be changed by overriding Backbone.InlineTemplate.hasInlineEl with a custom function. In order to
     * treat all templates as having an inline `el`, for instance, the custom function just has to return true:
     *
     *     Backbone.InlineTemplate.hasInlineEl = function () { return true; };
     *
     * @param   {jQuery}   $templateContainer  the template node (usually a <script> or a <template> tag)
     * @returns {boolean}
     */
    function _hasInlineEl ( $templateContainer ) {
        return $templateContainer.data( "el-definition" ) === "inline";
    }

    /**
     * Takes the raw text content of the template tag, extracts the inline `el` as well as its content, turns the `el`
     * string into a sample node and, finally, returns the $el sample and the inner content in a hash.
     *
     * @param   {string}              templateText
     * @returns {ParsedTemplateData}
     */
    function _parseTemplateHtml ( templateText ) {

        var elDefinition, $elSample, templateContent = "",
            matches = rxOutermostHtmlTagWithContent.exec( templateText ) || rxSelfClosingHtmlTag.exec( templateText );

        if ( !matches ) throw new Backbone.DeclarativeViews.TemplateError( 'Backbone.Inline.Template: Failed to parse template with inline `el` definition. No matching content found.\nTemplate text is "' + templateText + '"' );

        if ( matches[3] ) {
            // Applied regex for outermost HTML tag with content, capturing 3 groups
            elDefinition = matches[1] + matches[3];
            templateContent = matches[2];
        } else {
            // Applied regex for self-closing `el` tag without template content, not capturing any groups.
            elDefinition = matches[0];
        }
        
        try {
            $elSample = $( elDefinition );
        } catch ( err ) {
            throw new Backbone.DeclarativeViews.TemplateError( 'Backbone.Inline.Template: Failed to parse template with inline `el` definition. Extracted `el` could not be turned into a sample node.\nExtracted `el` definition string is "' + elDefinition + '", full template text is "' + templateText + '"' );
        }

        return {
            templateContent: templateContent,
            $elSample: $elSample
        };
    }

    /**
     * Takes an element node and maps its defining characteristics - tag name, classes, id, other attributes - to data
     * attributes on another node, in the format used by Backbone.Declarative.Views.
     *
     * In other words, it transforms an actual `el` sample node into a set of descriptive data attributes on a template.
     *
     * @param {jQuery} $sourceNode  the `el` sample node
     * @param {jQuery} $target      the template node
     */
    function _mapElementToDataAttributes ( $sourceNode, $target ) {

        var sourceProps = {
                tagName: $sourceNode.prop("tagName").toLowerCase(),
                className: $.trim( $sourceNode.attr( "class" ) ),
                id: $.trim( $sourceNode.attr( "id" ) ),
                otherAttributes: {}
            };

            _.each( $sourceNode[0].attributes, function ( attrNode ) {
                var name = attrNode.nodeName,
                    value = attrNode.nodeValue,
                    include = value && name !== "class" && name !== "id";

                if ( include ) sourceProps.otherAttributes[attrNode.nodeName] = value;
            } );

        if ( sourceProps.tagName !== "div" ) $target.attr( "data-tag-name", sourceProps.tagName );
        if ( sourceProps.className ) $target.attr( "data-class-name", sourceProps.className );
        if ( sourceProps.id ) $target.attr( "data-id", sourceProps.id );
        if ( _.size( sourceProps.otherAttributes ) ) $target.attr( "data-attributes", JSON.stringify( sourceProps.otherAttributes ) );

    }

    //
    // Generic helpers
    // ---------------

    /**
     * Checks if an entity can be passed to jQuery successfully and be resolved to a node which exists in the DOM.
     *
     * Can be used to verify
     * - that a string is a selector, and that it selects at least one existing element
     * - that a node is part of the document
     *
     * Returns false if passed e.g. a raw HTML string, or invalid data, or a detached node.
     *
     * @param   {*} testedEntity  can be pretty much anything, usually a string (selector) or a node
     * @returns {boolean}
     */
    function existsInDOM ( testedEntity ) {
        try {
            return $document.find( testedEntity ).length !== 0;
        } catch ( err ) {
            return false;
        }
    }


    //
    // Custom types
    // ------------
    //
    // For easier documentation and type inference.

    /**
     * @name  ParsedTemplateData
     * @type  {Object}
     *
     * @property {jQuery} $elSample
     * @property {string} templateContent
     */

} ));

