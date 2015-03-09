;( function ( Backbone, _ ) {
    "use strict";

    var originalConstructor = Backbone.View,
        templateCache = {};

    //
    // Core functionality and API
    // --------------------------

    _.extend( Backbone.View.prototype, {

        tagName: function () {
            return getViewTemplateData( this ).tagName || "div";
        },

        className: function () {
            return getViewTemplateData( this ).className || undefined;
        },

        id: function () {
            return getViewTemplateData( this ).id || undefined;
        },

        attributes: function () {
            return getViewTemplateData( this ).attributes || undefined;
        }

    } );

    Backbone.View = Backbone.View.extend( {

        constructor: function ( options ) {
            if ( options && options.template !== undefined ) this.template = options.template;

            this.declarativeViews = {
                meta: {},
                getCachedTemplate: _.partial( getViewTemplateData, this ),
                clearCachedTemplate: _.partial( clearViewTemplateCache, this )
            };

            originalConstructor.apply( this, arguments );
        }

    } );

    Backbone.DeclarativeViews = {
        getCachedTemplate: getTemplateData,
        clearCachedTemplate: clearCachedTemplate,
        clearCache: clearCache,
        custom: {
            loadTemplate: undefined
        }
    };

    //
    // Cache management
    // ----------------

    /**
     * Returns the template data associated with a template property string. Caches it in the process, or retrieves it
     * from the cache if already available.
     *
     * Return values are the same as in getViewTemplateData. See there for details.
     *
     * If there is no cacheable template data, the hash { valid: false } is returned.
     *
     * @param   {string} templateProp  template selector, or raw template HTML, identifying the cache entry
     * @returns {CachedTemplateData|Uncacheable}
     */
    function getTemplateData ( templateProp ) {
        var data;

        if ( _.isString( templateProp ) ) {

            data = templateCache[ templateProp ];
            if ( ! data ) data = _createTemplateCache( templateProp );

        } else {
            data = { valid: false };
        }

        return data;
    }

    /**
     * Returns the template data associated with a given view, provided that the template has been passed as a string
     * and is cacheable. Otherwise, the returned hash is empty except for a `valid` flag, which is false. Manages
     * caching behind the scenes.
     *
     * To be cacheable, the template property or option must be
     *
     * - a selector for the template element (and the element must actually exist)
     * - a raw HTML string which can be turned into a template element
     *
     * The template data is returned as a hash with the following properties:
     *
     * - html (string) - the actual template content if the template has been specified by selector
     * - tagName (string)
     * - className (string)
     * - attributes (hash of attributes and their values)
     * - valid (boolean, always true) - flag which signals that the data is a valid representation of the template
     *
     * If there is no cacheable template data, the hash { valid: false } is returned.
     *
     * @param   {Backbone.View} view
     * @returns {CachedTemplateData|Uncacheable}
     */
    function getViewTemplateData ( view ) {
        var data,
            meta = view.declarativeViews.meta;

        if ( ! meta.processed ) {

            if ( view.template && _.isString( view.template ) ) {

                data = getTemplateData( view.template );

                meta.processed = true;
                meta.inGlobalCache = true;
                meta.originalTemplateProp = view.template;

            } else {

                data = { valid: false };

                meta.processed = true;
                meta.inGlobalCache = false;

            }

        } else {
            data = meta.inGlobalCache ? getTemplateData( meta.originalTemplateProp ) : { valid: false };
        }

        return data;
    }

    /**
     * Clears the cache as a whole.
     *
     * Also clears the Marionette cache (if Marionette is available). Note that this is one-directional: Clearing the
     * cache _in Marionette_ does not also clear the DeclarativeViews cache. Activate full Marionette integration for
     * that (see below, clearCachedTemplate()).
     *
     * @param {boolean} [fromMarionette=false]  internal flag to prevent circular calls to and from Marionette
     */
    function clearCache ( fromMarionette ) {
        templateCache = {};
        if ( ! fromMarionette && Backbone.Marionette && Backbone.Marionette.TemplateCache ) Backbone.Marionette.TemplateCache.clear();
    }

    /**
     * Removes one or more cache entries.
     *
     * Arguments
     * ---------
     *
     * The strings identifying the cache entries can be passed in as individual arguments (prop1, prop2, ...), or as an
     * array. Each string must be
     *
     * - a template selector
     * - raw HTML of a template, if that's what the template property held when a view made use of it.
     *
     * A template selectors must be identical to the one which was used when creating the cache entry, ie the selector
     * specified in the template property or template option of a view. Mere selector equivalence (e.g. "#template" and
     * "script#template") won't match the cache.
     *
     * Strings not matching a cache entry are ignored, as are non-string arguments.
     *
     * Marionette.TemplateCache
     * ------------------------
     *
     * When templates are cleared here, they are removed from the Marionette template cache as well (if Marionette is
     * loaded).
     *
     * This is one-directional. If it is supposed to work both ways, and cache clearing in Marionette should clear the
     * cache in Backbone.Declarative.Views as well, activate full Marionette integration. Load the provided helper,
     * marionette.declarativeviews.integration.js, or another component taking care of that integration (e.g.
     * Marionette.Handlebars).
     *
     * @param {...string|string[]} [templateProp]  template selector(s), or raw template HTML, identifying the cache
     *                                             entry. NB The last argument can also be an internal "fromMarionette"
     *                                             flag to prevent circular calls to and from Marionette
     */
    function clearCachedTemplate ( templateProp ) {

        var fromMarionette = false,
            args = _.toArray( arguments ),
            lastArg = _.last( args );

        // When called from Marionette, or called recursively, the last argument is a "fromMarionette" boolean. Splice
        // it off before proceeding.
        if ( args.length && _.isBoolean( lastArg ) ) fromMarionette = args.pop();

        // Handle multiple template props passed in as a varargs list, or as an array, with recursive calls for each
        // template property.
        if ( args.length > 1 ) {
            _.each( args, function ( singleProp ) { clearCachedTemplate( singleProp, fromMarionette ); } );
        } else if ( _.isArray( templateProp ) || _.isArguments( templateProp ) ) {
            _.each( templateProp, function ( singleProp ) { clearCachedTemplate( singleProp, fromMarionette ); } );
        } else {

            if ( ! templateProp ) throw new Error( "Missing argument: string identifying the template. The string should be a template selector or the raw HTML of a template, as provided to the template property of a view when the cache entry was created" );

            // Dealing with a single templateProp argument.
            //
            // Delete the corresponding cache entry.  Try to clear it from the Marionette cache as well. The
            // templateProp must be a string - non-string arguments are quietly ignored.
            if ( _.isString( templateProp ) ) {

                _clearCachedTemplate( templateProp );

                if ( ! fromMarionette && Backbone.Marionette && Backbone.Marionette.TemplateCache ) {
                    try {
                        Backbone.Marionette.TemplateCache.clear( templateProp );
                    } catch ( err ) {}
                }

            }

        }

    }

    /**
     * Removes the template cache entry associated with a given view, provided that a cache entry exists.
     *
     * @param {Backbone.View} view
     */
    function clearViewTemplateCache ( view ) {
        var meta = view.declarativeViews.meta;

        if ( meta.processed ) {
            if ( meta.inGlobalCache ) _clearCachedTemplate( meta.originalTemplateProp );
        } else if ( view.template && _.isString( view.template ) ) {
            _clearCachedTemplate( view.template );
        }
    }

    /**
     * Creates a cache entry for a given template property.
     *
     * Returns the cached entry if creating it has succeeded. In case of failure, it returns the hash { valid: false }.
     * It signals that the returned hash, as well as the cache itself, does not contain valid data for the template
     * property.
     *
     * The creation of a cache entry can fail if the template property is an empty string, or a selector which doesn't
     * match anything, or a string which jQuery can't process.
     *
     * Uses a custom loader if specified, instead of loading the template with jQuery (default).
     *
     * @param   {string} templateProp  template selector, or raw template HTML, identifying the cache entry
     * @returns {CachedTemplateData|Uncacheable}
     */
    function _createTemplateCache( templateProp ) {
        var $template, data, html, outerTagParts,
            customLoader = Backbone.DeclarativeViews.custom.loadTemplate,
            cacheId = templateProp;

        try {
            $template = customLoader ? customLoader( templateProp ) : Backbone.$( templateProp );
        } catch ( err ) {
            $template = "";
        }

        if ( customLoader && $template !== "" && ! ( $template instanceof Backbone.$ ) ) throw new Error( "Invalid return value. Custom loadTemplate function must return a jQuery instance, but it hasn't" );

        if ( $template.length ) {

            // Read the el-related data attributes of the template.
            data = _getDataAttributes( $template ) ;

            html = $template.html();
            outerTagParts = getOuterTagParts( $template, html );

            templateCache[cacheId] = {
                html: html,
                outerHtml: _.partial( outerHtml, cacheId, outerTagParts[0], outerTagParts[1] ),
                tagName: data.tagName,
                className: data.className,
                id: data.id,
                attributes: data.attributes,

                valid: true
            };

        } else {
            templateCache[cacheId] = { valid: false };
        }

        return templateCache[cacheId];
    }

    /**
     * Removes a cache entry.
     *
     * @param {string} templateProp  template selector, or raw template HTML, identifying the cache entry
     */
    function _clearCachedTemplate ( templateProp ) {
        if ( templateCache[ templateProp ] ) delete templateCache[ templateProp ];
    }

    /**
     * Returns the data attributes of an element.
     *
     * Makes sure that the data attributes describing a Backbone el are read from the DOM, circumventing a potentially
     * stale jQuery cache. The jQuery cache is updated in the process (but for these attributes only).
     *
     * That is necessary because jQuery keeps its own cache of data attributes. There is no API to clear or circumvent
     * that cache. $.fn.removeData() and $.removeData() set the cached values to undefined, and undefined is returned on
     * next access - not the actual values in the DOM.
     *
     * So here, we force-update the jQuery cache, making sure that changes of the HTML5 data-* attributes in the DOM are
     * picked up.
     *
     * @param   {jQuery} $elem
     * @returns {Object}
     */
    function _getDataAttributes ( $elem ) {

        if ( $.hasData( $elem[0] ) ) {

            // A jQuery data cache exists. Update it for the el properties.
            $elem.data( {
                tagName: $elem.attr( "data-tag-name" ),
                className: $elem.attr( "data-class-name" ),
                id: $elem.attr( "data-id" )
            } );

            try {
                $elem.data( "attributes", $.parseJSON( $elem.attr( "data-attributes" ) ) );
            } catch ( err ) {
                $elem.removeData( "attributes" );
            }

        }

        return $elem.data();
    }

    /**
     * Restores the outer HTML of a template stored in the cache, given the cache ID and the opening and closing tag of
     * the outer node. Returns the HTML as a string.
     *
     * @param   {string} cacheId
     * @param   {string} openingTag
     * @param   {string} closingTag
     * @returns {string}
     */
    function outerHtml ( cacheId, openingTag, closingTag ) {
        return openingTag + templateCache[cacheId].html + closingTag;
    }

    /**
     * Returns the opening and closing tag of the template node, given the $template. Returns them in an array
     * (0: opening tag, 1: closing tag).
     *
     * If the inner HTML of the template has already been extracted in the calling code, it is more efficient to pass it
     * in as well.
     *
     * @param   {jQuery} $template
     * @param   {string} [html]     the inner HTML of the template node, if already available
     * @returns {string[]}
     */
    function getOuterTagParts ( $template, html ) {
        if ( ! html ) html = $template.html();

        return $template
            .prop( "outerHTML" )
            .replace( html, "\n" )
            .split( "\n" );
    }


    //
    // Custom types
    // ------------
    //
    // For easier documentation and type inference.

    /**
     * @name  CachedTemplateData
     * @type  {Object}
     *
     * @property {string}  html
     * @property {string}  tagName
     * @property {string}  className
     * @property {string}  id
     * @property {Object}  attributes
     * @property {boolean} valid            always true
     */

    /**
     * @name  Uncacheable
     * @type  {Object}
     *
     * @property {boolean} valid            always false
     */

}( Backbone, _ ));