;( function ( Backbone, _ ) {
    "use strict";

    //
    // Marionette integration
    // ----------------------

    var originalClearCache;

    // Only run if Marionette is available. Check if another module has already handled Marionette integration
    if ( Backbone.Marionette && Backbone.Marionette.TemplateCache && ! Backbone.DeclarativeViews._marionetteIntegration ) {

        // Flag that Marionette integration is done, for use by other components
        Backbone.DeclarativeViews._marionetteIntegration = true;

        originalClearCache = Backbone.Marionette.TemplateCache.clear;

        // Custom implementation of Marionette.TemplateCache.loadTemplate()
        //
        // Retrieves the template HTML through the Backbone.DeclarativeViews caching mechanism, rather than through
        // direct DOM access with a jQuery call (as the original loadTemplate() does).
        //
        // If the template is already in the DeclarativeViews cache, DOM access is no longer necessary. If not, a
        // call to the DeclarativeViews cache gets it from the DOM anyway, with the added benefit of priming both
        // caches at once.

        Backbone.Marionette.TemplateCache.prototype.loadTemplate = function ( templateId, options ) {
            var templateData, templateHtml,
                errType = 'NoTemplateError',
                errMsg = 'Could not find template: "' + templateId + '"';

            templateData = Backbone.DeclarativeViews.getCachedTemplate( templateId );
            if ( templateData.valid ) templateHtml = templateData.html;

            // Throw an error if the template is missing, just like the original implementation.
            if ( !templateHtml || templateHtml.length === 0 ) {

                if ( Backbone.Marionette.Error ) {
                    // Error handling in Marionette 2.x
                    throw new Backbone.Marionette.Error( { name: errType, message: errMsg } );
                } else if ( typeof throwError === "function" ) {
                    // Error handling in Marionette 1.x
                    throwError( errMsg, errType );
                } else {
                    // Being future proof, we throw our own errors if all else has failed
                    throw new Error( errMsg );
                }

            }

            return templateHtml;
        };

        // Custom implementation of Marionette.TemplateCache.clear()
        //
        // When the Marionette cache is cleared, the DeclarativeViews cache is cleared as well.

        Backbone.Marionette.TemplateCache.clear = function () {
            if ( arguments.length ) {
                Backbone.DeclarativeViews.clearCachedTemplate( arguments );
            } else {
                Backbone.DeclarativeViews.clearCache();
            }

            originalClearCache.apply( this, arguments );
        };

    }

}( Backbone, _ ));