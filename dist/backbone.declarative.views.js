// Backbone.Declarative.Views, v3.0.1
// Copyright (c) 2014-2016 Michael Heim, Zeilenwechsel.de
// Distributed under MIT license
// http://github.com/hashchange/backbone.declarative.views

;( function ( root, factory ) {
    "use strict";

    // UMD for a Backbone plugin. Supports AMD, Node.js, CommonJS and globals.
    //
    // - Code lives in the Backbone namespace.
    // - The module does not export a meaningful value.
    // - The module does not create a global.

    var supportsExports = typeof exports === "object" && exports && !exports.nodeType && typeof module === "object" && module && !module.nodeType;

    // AMD:
    // - Some AMD build optimizers like r.js check for condition patterns like the AMD check below, so keep it as is.
    // - Check for `exports` after `define` in case a build optimizer adds an `exports` object.
    // - The AMD spec requires the dependencies to be an array **literal** of module IDs. Don't use a variable there,
    //   or optimizers may fail.
    if ( typeof define === "function" && typeof define.amd === "object" && define.amd ) {

        // AMD module
        define( [ "exports", "underscore", "backbone" ], factory );

    } else if ( supportsExports ) {

        // Node module, CommonJS module
        factory( exports, require( "underscore" ), require( "backbone" ) );

    } else  {

        // Global (browser or Rhino)
        factory( {}, _, Backbone );

    }

}( this, function ( exports, _, Backbone ) {
    "use strict";

    var originalClearCache,                     // for Marionette only
        originalConstructor = Backbone.View,
        templateCache = {},
        instanceCacheAliases = [],

        registeredDataAttributes = {
            primitives: [],
            json: []
        },

        rxElDefinitionComment,
        rxRegisteredDataAttributes = {},

        GenericError = createCustomErrorType( "Backbone.DeclarativeViews.Error" ),
        TemplateError = createCustomErrorType( "Backbone.DeclarativeViews.TemplateError" ),
        CompilerError =  createCustomErrorType( "Backbone.DeclarativeViews.CompilerError" ),
        CustomizationError = createCustomErrorType( "Backbone.DeclarativeViews.CustomizationError" ),

        $ = Backbone.$;

    //
    // Core functionality and API
    // --------------------------

    _.extend( Backbone.View.prototype, {

        tagName: function () {
            var data = getViewTemplateData( this ) || {};
            return data.tagName || "div";
        },

        className: function () {
            var data = getViewTemplateData( this ) || {};
            return data.className || undefined;
        },

        id: function () {
            var data = getViewTemplateData( this ) || {};
            return data.id || undefined;
        },

        attributes: function () {
            var data = getViewTemplateData( this ) || {};
            return data.attributes || undefined;
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

            _.each( instanceCacheAliases, function ( alias ) {
                this[alias] = this.declarativeViews;
            }, this );

            originalConstructor.apply( this, arguments );
        }

    } );

    Backbone.DeclarativeViews = {
        getCachedTemplate: getTemplateData,
        clearCachedTemplate: clearCachedTemplate,
        clearCache: clearCache,
        
        Error: GenericError,
        TemplateError: TemplateError,
        CompilerError: CompilerError,
        CustomizationError: CustomizationError,

        plugins: {
            registerDataAttribute: _registerDataAttribute,
            getDataAttributes: _getDataAttributes,
            updateJqueryDataCache: _updateJQueryDataCache,
            registerCacheAlias: _registerCacheAlias
        },

        defaults: {
            loadTemplate: loadTemplate
        },

        custom: {
            /** @type {Function|undefined} */
            loadTemplate: undefined,
            /** @type {Function|undefined} */
            compiler: undefined
        },

        version: "3.0.1"
    };

    //
    // Initialization
    // --------------
    _registerDataAttribute( "tag-name" );
    _registerDataAttribute( "class-name" );
    _registerDataAttribute( "id" );
    _registerDataAttribute( "attributes", { isJSON: true } );

    //
    // Cache management
    // ----------------

    /**
     * Returns the template data associated with a template property string. Caches it in the process, or retrieves it
     * from the cache if already available. Returns undefined if there is no cacheable template data.
     *
     * The template data is returned as a hash. For a list of properties, see readme.
     *
     * @param   {string} templateProp  template selector, or raw template HTML, identifying the cache entry
     * @returns {CachedTemplateData|undefined}
     */
    function getTemplateData ( templateProp ) {
        var data;

        if ( templateProp && _.isString( templateProp ) ) {

            data = templateCache[ templateProp ];
            if ( ! data ) data = _createTemplateCache( templateProp );

            if ( data.invalid ) data = undefined;

        }

        return data;
    }

    /**
     * Returns the template data associated with a given view, provided that the template has been passed as a string
     * and is cacheable. Otherwise, it returns undefined. Manages caching behind the scenes.
     *
     * To be cacheable, the template property or option must be
     *
     * - a selector for the template element (and the element must actually exist)
     * - a raw HTML string which can be turned into a template element
     *
     * The template data is returned as a hash. For a list of properties, see readme.
     *
     * @param   {Backbone.View} view
     * @returns {CachedTemplateData|undefined}
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

                data = undefined;

                meta.processed = true;
                meta.inGlobalCache = false;

            }

        } else {
            data = meta.inGlobalCache ? getTemplateData( meta.originalTemplateProp ) : undefined;
        }

        return data;
    }

    /**
     * Clears the cache as a whole.
     *
     * Also clears the Marionette cache (if Marionette is available).
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
     * A template selector must be identical to the one which was used when creating the cache entry, ie the selector
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

            if ( ! templateProp ) throw new GenericError( "Missing argument: string identifying the template. The string should be a template selector or the raw HTML of a template, as provided to the template property of a view when the cache entry was created" );

            // Dealing with a single templateProp argument.
            //
            // Delete the corresponding cache entry. Try to clear it from the Marionette cache as well. The
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
     * Defines the default template loader. Accepts a selector string and returns the template node (usually a <script>
     * or <template> node) in a jQuery wrapper.
     *
     * Is only ever called with a string argument. There is no need to handle other argument types here, or guard
     * against them.
     *
     * Interprets the argument as a selector first and returns the corresponding node if it exists. If not, the argument
     * is interpreted as a raw HTML/template string and wrapped in a script tag (of type text/x-template). If the raw
     * template string contains a comment describing the el, the related data attributes are created on the script tag.
     *
     * NB Raw template strings are never altered, and not interpreted (apart from looking for the el-related comment).
     *
     * @param   {string} templateProperty
     * @returns {jQuery}
     */
    function loadTemplate ( templateProperty ) {
        var $template;

        try {
            $template = $( templateProperty );

            // If the template is not in the DOM, treat the template property as a raw template string instead. That
            // part is handled in `catch`, and should not be guarded against further errors here. To switch to that
            // process, just throw an error.
            if ( !$.contains( document.documentElement, $template[0] ) ) throw new Error();
        } catch ( err ) {
            $template = _wrapRawTemplate( templateProperty );

            // If the template string cannot be retrieved unaltered even after wrapping it in a script tag, bail out by
            // throwing a silent error (will be caught, and not propagated further, in _createTemplateCache()).
            if ( $template.html() !== templateProperty ) throw new Error( "Failed to wrap template string in script tag without altering it" );
        }

        return $template;
    }

    /**
     * Takes a raw HTML/template string and wraps it in a script tag (of type "text/x-template"). In the process, it
     * detects el-related data attributes which are contained in an HTML comment, and sets them on the script tag.
     * Returns the script element, as a jQuery object.
     *
     * @param   {string} templateString
     * @returns {jQuery}
     */
    function _wrapRawTemplate( templateString ) {
        var $wrapper = $( "<script />" )
                .attr( "type", "text/x-template" )
                .text( templateString ),

            elDataAttributes = _getEmbeddedElAttributes( templateString );

        if ( elDataAttributes ) $wrapper.attr( elDataAttributes );

        return $wrapper;
    }

    /**
     * Takes a raw HTML/template string and looks for el-related data attributes which are contained in a comment.
     * Returns the attributes hash, or undefined if no attributes are found.
     *
     * The keys in the hash are the data attribute names, ie they include the "data-" prefix.
     *
     * @param   {string} templateString
     * @returns {Object|undefined}
     */
    function _getEmbeddedElAttributes ( templateString ) {
        var elDataAttributes = {},

            elDefinitionMatch = rxElDefinitionComment.exec( templateString ),
            elDefinitionComment = elDefinitionMatch && elDefinitionMatch[0];

        if ( elDefinitionComment ) {
            _.each( rxRegisteredDataAttributes, function ( rxAttributeMatcher, attributeName ) {
                var match = rxAttributeMatcher.exec( elDefinitionComment ),
                    attributeValue = match && match[2];

                if ( attributeValue ) elDataAttributes[attributeName] = attributeValue;
            } );
        }

        return _.size( elDataAttributes ) ? elDataAttributes : undefined;
    }

    /**
     * Creates a cache entry for a given template property.
     *
     * Returns the cached entry if creating it has succeeded. In case of failure, it returns the hash { invalid: true }.
     * It signals that the template has been processed, but that the returned hash, as well as the cache itself, does
     * not contain valid data for the template property.
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
        var $template, data, html,

            customLoader = Backbone.DeclarativeViews.custom.loadTemplate,
            defaultLoader = Backbone.DeclarativeViews.defaults.loadTemplate,
            modifiedDefaultLoader = defaultLoader !== loadTemplate,

            cacheId = templateProp;

        try {
            $template = customLoader ? customLoader( templateProp ) : defaultLoader( templateProp );
        } catch ( err ) {
            // Rethrow and exit if the alarm has been raised deliberately, using an error type of Backbone.DeclarativeViews.
            if( _isDeclarativeViewsErrorType( err ) ) throw err;
            // Otherwise, continue without having fetched a template.
            $template = "";
        }

        if ( ( customLoader || modifiedDefaultLoader ) && $template !== "" && ! ( $template instanceof Backbone.$ ) ) {
            throw new CustomizationError( "Invalid return value. The " + ( customLoader ? "custom" : "default" ) + " loadTemplate function must return a jQuery instance, but it hasn't" );
        }

        if ( $template.length ) {

            // Read the el-related data attributes of the template.
            data = _getDataAttributes( $template ) ;

            html = $template.html();

            templateCache[cacheId] = {
                html: html,
                compiled: _compileTemplate( html, $template ),

                tagName: data.tagName,
                className: data.className,
                id: data.id,
                attributes: data.attributes
            };

        } else {
            templateCache[cacheId] = { invalid: true };
        }

        return templateCache[cacheId];
    }

    /**
     * Returns the compiled template if a custom compiler is set in Backbone.DeclarativeViews.custom.compiler, or
     * undefined if no compiler is set.
     *
     * The compiler function is passed the inner HTML of the template node as first argument, and the $template node
     * itself, in a jQuery wrapper, as the second argument.
     *
     * The compiler should return a function which can be called with the template vars as arguments, producing the
     * final HTML. This is not enforced, though - the compiler can in fact return anything because who knows what hacks
     * people come up with.
     *
     * @param   {string} html
     * @param   {jQuery} $template
     * @returns {Function|undefined}
     */
    function _compileTemplate ( html, $template ) {
        var compiled,
            customCompiler = Backbone.DeclarativeViews.custom.compiler;

        if ( customCompiler ) {

            if ( customCompiler  && !_.isFunction( customCompiler ) ) throw new CustomizationError( "Invalid custom template compiler set in Backbone.DeclarativeViews.custom.compiler: compiler is not a function" );

            try {
                compiled = customCompiler( html, $template );
            } catch ( err ) {
                throw new CompilerError( 'An error occurred while compiling the template. The compiler had been passed the HTML string "' + html + '" as the first argument, and the corresponding template node, wrapped in a jQuery object, as the second argument' );
            }

        }

        return compiled;
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
     * Adds a name to the list of data attributes which are used and managed by Backbone.Declarative.Views. The name
     * must be passed without the "data-" prefix, but written as in the data attribute (ie "tag-name", not "tagName").
     *
     * When a data attribute is used to store stringified JSON objects, the flag `{ isJSON: true }` must be set in the
     * options. Primitive data attributes (of type string, number, boolean) don't need a flag.
     *
     * The names "html" and "compiled" are illegal because they are reserved. They are already in use in the cache
     * object, so there could be a conflict further down the line. Also, a name can only be registered once. And, as
     * said before, it must not be prefixed with "data-". Violations of these rules cause an error to be thrown.
     *
     * Registering a data attribute has the following effects:
     *
     * - When a registered data attribute is queried by Backbone.Declarative.Views, the attribute is refreshed from the
     *   DOM and updated in the jQuery data cache. Changes to the attribute in the DOM are picked up that way. The
     *   update can also be triggered externally, e.g. by a plugin, with `updateJqueryDataCache()`.
     *
     * - A registered data attribute is detected in a raw HTML/template string, provided that it is placed into a
     *   comment. It must be written as it would appear on a script or template tag, ie in dashed form and including the
     *   "data-" prefix, just like the standard `el`-defining attributes. Custom attributes and `el`-defining attributes
     *   must be placed into the same, single comment.
     *
     *   The registered attribute is then created on the temporary script tag which is wrapped around the template
     *   string, along with the `el`-defining data attributes. But unlike these, the custom attribute does not make it
     *   into the cache (nor does the script tag).
     *
     *   However, the script tag can be accessed and examined by a custom loader. For that to happen, the custom loader
     *   has to invoke the default loader before processing the result further. Custom attributes can be read this way.
     *
     * @param {string}  name                    as in the data attribute (e.g. "tag-name", not "tagName"), and without "data-" prefix
     * @param {object}  [options]
     * @param {boolean} [options.isJSON=false]
     */
    function _registerDataAttribute ( name, options ) {
        var existingNames = _getRegisteredDataAttributeNames(),
            fullName = "data-" + name,
            type = options && options.isJSON ? "json" : "primitives",
            names = registeredDataAttributes[type];

        if ( name.indexOf( "data-" ) === 0 ) throw new CustomizationError( 'registerDataAttribute(): Illegal attribute name "' + name + '", must be registered without "data-" prefix' );
        if ( name === "html" || name === "compiled" ) throw new CustomizationError( 'registerDataAttribute(): Cannot register attribute name "' + name + '" because it is reserved' );
        if ( _.contains( existingNames, name ) ) throw new CustomizationError( 'registerDataAttribute(): Cannot register attribute name "' + name + '" because it has already been registered' );

        // Add the name to the list of registered data attributes
        names.push( name );
        registeredDataAttributes[type] = _.uniq( names );

        // Create amd store a regex matching the attribute and its value in an HTML/template string, for transfer onto a
        // wrapper node (see _wrapRawTemplate())
        rxRegisteredDataAttributes[fullName] = new RegExp( fullName + "\\s*=\\s*(['\"])([\\s\\S]+?)\\1" );

        // Update the regular expression which tests an HTML/template string and detects a comment containing registered
        // attributes.
        rxElDefinitionComment = _createElDefinitionCommentRx();
    }

    /**
     * Returns the names of all registered attributes. These names are dashed but don't include the "data-" prefix.
     *
     * @returns {string[]}
     */
    function _getRegisteredDataAttributeNames () {
        return registeredDataAttributes.primitives.concat( registeredDataAttributes.json );
    }

    /**
     * Returns a regular expression which tests an HTML/template string and detects a comment containing at least one
     * registered attribute. Stops after the first matching comment is found (no /g flag).
     *
     * NB When the default el-related attributes are registered, this is the resulting regex:
     * /<!--(?:(?!-->)[\s\S])*?data-(?:tag-name|class-name|id|attributes)\s*=\s*(['"])[\s\S]+?\1[\s\S]*?-->/
     *
     * @returns {RegExp}
     */
    function  _createElDefinitionCommentRx () {
        return new RegExp( "<!--(?:(?!-->)[\\s\\S])*?data-(?:" + _getRegisteredDataAttributeNames().join( "|" ) + ")\\s*=\\s*(['\"])[\\s\\S]+?\\1[\\s\\S]*?-->" );
    }

    /**
     * Returns the data attributes of an element.
     *
     * Makes sure that the registered data attributes, which describe a Backbone el, are read from the DOM directly,
     * circumventing a potentially stale jQuery cache. The jQuery cache is updated in the process (but for these
     * attributes only).
     *
     * With registerDataAttribute(), plugins can register additional data attributes to have them handled the same way.
     *
     * See _updateJQueryDataCache() for more about updating the jQuery data cache.
     *
     * @param   {jQuery} $elem
     * @returns {Object}
     */
    function _getDataAttributes ( $elem ) {
        _updateJQueryDataCache( $elem );
        return $elem.data();
    }

    /**
     * Reads registered data attributes of a given element from the DOM, and updates an existing jQuery data cache with
     * these values.
     *
     * If no jQuery data cache exists, it is NOT created by the call. (This function is meant to be used as an efficient,
     * internal tool.) If you need to make sure the jQuery data cache is current and in sync with the DOM, and also
     * create it if it doesn't exist, just call _getDataAttributes() instead.
     *
     * The function is needed because jQuery keeps its own cache of data attributes, but there is no API to clear or
     * circumvent that cache. The jQuery functions $.fn.removeData() and $.removeData() don't do that job: despite their
     * name, they don't actually remove the cached values but set them to undefined. So undefined is returned on next
     * access - not the actual values in the DOM.
     *
     * Here, we force-update the jQuery cache, making sure that changes of the HTML5 data-* attributes in the DOM are
     * picked up.
     *
     * The implementation circumvents the numerous bugs of jQuery.fn.data(), in particular when removing data. The
     * behaviour and bugs of a .data() call vary by jQuery version. For an overview of that mess, see
     * http://jsbin.com/venuqo/4/edit?html,js,console
     *
     * NB The cache update is limited to the data attributes which have been registered with _registerDataAttribute().
     * By default, only attributes which are "owned" by Backbone.Declarative.Views are updated - ie, the ones describing
     * the `el` of a view. Other HTML5 data-* attributes are not updated in the jQuery cache because it would interfere
     * with the responsibilities of other code.
     *
     * @param   {jQuery} $elem
     * @returns {Object}
     */
    function _updateJQueryDataCache ( $elem ) {
        var add = {},
            remove = [];

        if ( $.hasData( $elem[0] ) ) {

            // A jQuery data cache exists. Update it for the el properties (and attribute names registered by a plugin).

            // Primitive data types. Normally, this will read the "data-tag-name", "data-class-name" and "data-id"
            // attributes.
            _.each( registeredDataAttributes.primitives, function ( attributeName ) {
                var attributeValue = $elem.attr( "data-" + attributeName );

                if ( attributeValue === undefined ) {
                    remove.push( attributeName );
                } else {
                    add[toCamelCase( attributeName )] = attributeValue;
                }
            } );

            // Stringified JSON data. Normally, this just deals with "data-attributes".
            _.each( registeredDataAttributes.json, function ( attributeName ) {
                var attributeValue = $elem.attr( "data-" + attributeName );

                if ( attributeValue === undefined ) {
                    remove.push( attributeName );
                } else {

                    try {
                        add[toCamelCase( attributeName )] = $.parseJSON( attributeValue );
                    } catch ( err ) {
                        remove.push( attributeName );
                    }

                }
            } );

            if ( remove.length ) $elem.removeData( remove );
            if ( _.size( add ) ) $elem.data( add );
        }

    }

    /**
     * Registers an alternative way to access the cache and set up a custom compiler and loader. Intended for use by
     * plugins.
     *
     * A cache alias just adds syntactic sugar for users wanting to manage and access the cache from a plugin namespace.
     * The registration creates references to `getCachedTemplate`, `clearCachedTemplate`, `clearCache`, and the `custom` 
     * object in the alternative namespace.
     *
     * You can also register the name of an alias to use on view instances (optional). A property of that name will be
     * created on each view. It references the declarativeViews property of the view.
     *
     * @param {Object} namespaceObject              e.g. Backbone.InlineTemplate
     * @param {string} [instanceCachePropertyName]  the name of the cache property on a view instance, e.g. "inlineTemplate"
     */
    function _registerCacheAlias( namespaceObject, instanceCachePropertyName ) {
        namespaceObject.getCachedTemplate = Backbone.DeclarativeViews.getCachedTemplate;
        namespaceObject.clearCachedTemplate = Backbone.DeclarativeViews.clearCachedTemplate;
        namespaceObject.clearCache = Backbone.DeclarativeViews.clearCache;
        namespaceObject.custom = Backbone.DeclarativeViews.custom;
        
        if ( instanceCachePropertyName ) {
            instanceCacheAliases.push( instanceCachePropertyName );
            instanceCacheAliases = _.unique( instanceCacheAliases );
        }
    }

    /**
     * Checks if an error belongs to the error types of Backbone.DeclarativeViews.
     *
     * ATTN Update this check as new error types are added to Backbone.DeclarativeViews.
     *
     * @param   {Object}  error
     * @returns {boolean}
     */
    function _isDeclarativeViewsErrorType ( error ) {
        return error instanceof GenericError ||
               error instanceof TemplateError ||
               error instanceof CompilerError ||
               error instanceof CustomizationError;
    }

    //
    // Marionette integration
    // ----------------------

    // Only run if Marionette is available.
    if ( Backbone.Marionette && Backbone.Marionette.TemplateCache ) {

        originalClearCache = Backbone.Marionette.TemplateCache.clear;

        // Custom implementation of Marionette.TemplateCache.clear()
        //
        // When the Marionette cache is cleared, the DeclarativeViews cache is cleared as well. This is not technically
        // necessary, but makes sense. If there is a reason to invalidate a cached template, it applies to all caches.

        Backbone.Marionette.TemplateCache.clear = function () {
            if ( arguments.length ) {
                Backbone.DeclarativeViews.clearCachedTemplate( arguments, true );
            } else {
                Backbone.DeclarativeViews.clearCache( true );
            }

            originalClearCache.apply( this, arguments );
        };

        // Removed: integration of the Marionette and Backbone.Declarative.Views template loading mechanisms
        //
        // Integrating the template loaders turned out to be of little or no benefit, and could potentially have caused
        // problems with other custom loaders. In detail:
        //
        // - Integration saved exactly one DOM access per *template*. Given the limited number of templates in a project,
        //   the performance gain had often been too small to even be measurable.
        //
        // - During testing with just a single template, the net effect was even negative (!) - integration and the
        //   associated overhead seemed to slow things down.
        //
        // - With integration, custom loaders like the one for Marionette/Handlebars had been trickier to use. Load
        //   order suddenly mattered. The code setting up a custom loader had to be run after integrating
        //   Backbone.Declarative.Views with Marionette. Otherwise, the custom loader would haven been overwritten,
        //   breaking the application.
        //
        // In a nutshell, loader integration has proven to be more trouble than it is worth.

    }

    //
    // Generic helpers
    // ---------------

    /**
     * Turns a dashed string into a camelCased one.
     *
     * Simple implementation, but good enough for data attributes.
     *
     * @param   {string} dashed
     * @returns {string}
     */
    function toCamelCase ( dashed ) {
        return dashed.replace( /([^-])-([a-z])/g, function ( $0, $1, $2 ) {
            return $1 + $2.toUpperCase();
        } );
    }

    /**
     * Creates and returns a custom error type.
     *
     * See gist at https://gist.github.com/hashchange/4c1ce239570c77e698c1d2df09d0e540
     *
     * @param   {string} name  of the error type
     * @returns {Error}
     */
    function createCustomErrorType ( name ) {

        function CustomError ( message ) {
            this.message = message;

            if ( Error.captureStackTrace ) {
                Error.captureStackTrace( this, this.constructor );
            } else {
                this.stack = ( new Error() ).stack;
            }
        }

        CustomError.prototype = new Error();
        CustomError.prototype.name = name;
        CustomError.prototype.constructor = CustomError;

        return CustomError;
    }


    // Module return value
    // -------------------
    //
    // A return value may be necessary for AMD to detect that the module is loaded. It ony exists for that reason and is
    // purely symbolic. Don't use it in client code. The functionality of this module lives in the Backbone namespace.
    exports.info = "Backbone.Declarative.Views has loaded. Don't use the exported value of the module. Its functionality is available inside the Backbone namespace.";


    //
    // Custom types
    // ------------
    //
    // For easier documentation and type inference.

    /**
     * @name  CachedTemplateData
     * @type  {Object}
     *
     * @property {string}              html
     * @property {Function|undefined}  compiled
     * @property {string|undefined}    tagName
     * @property {string|undefined}    className
     * @property {string|undefined}    id
     * @property {Object|undefined}    attributes
     */

    /**
     * @name  Uncacheable
     * @type  {Object}
     *
     * @property {boolean} invalid     always true
     */

} ) );