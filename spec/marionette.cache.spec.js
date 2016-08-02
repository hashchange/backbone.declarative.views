/*global describe, it */
(function () {
    "use strict";

    // These tests require that Marionette has been loaded before Backbone.Declarative.Views.

    describe( 'Integrated cache access of Marionette and Backbone.Declarative.Views', function () {

        var dataAttributes, dataAttributes2, dataAttributes3,
            $templateNode, $templateNode2, $templateNode3,
            modifiedDataAttributes, modifiedHtml, View,

            cleanup = function () {
                Backbone.DeclarativeViews.clearCache();
                Backbone.Marionette.TemplateCache.clear();
            };

        beforeEach ( function () {
            cleanup();

            var genericTemplateTag = '<script type="text/x-template"></script>';

            dataAttributes = {
                "data-tag-name": "section",
                "data-class-name": "dataClass",
                "data-id": "dataId",
                "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
            };

            dataAttributes2 = {
                "data-tag-name": "li",
                "data-class-name": "dataClass2",
                "data-id": "dataId2",
                "data-attributes": '{ "lang": "fr", "title": "title from data attributes 2" }'
            };

            dataAttributes3 = {
                "data-tag-name": "h2",
                "data-class-name": "dataClass3",
                "data-id": "dataId3",
                "data-attributes": '{ "lang": "de", "title": "title from data attributes 3" }'
            };

            $templateNode = $( genericTemplateTag )
                .attr( "id", "template" )
                .attr( dataAttributes )
                .text( "Content of template #1" )
                .appendTo( "body" );

            $templateNode2 = $( genericTemplateTag )
                .attr( "id", "template2" )
                .attr( dataAttributes2 )
                .text( "Content of template #2" )
                .appendTo( "body" );

            $templateNode3 = $( genericTemplateTag )
                .attr( "id", "template3" )
                .attr( dataAttributes3 )
                .text( "Content of template #3" )
                .appendTo( "body" );

            modifiedDataAttributes = {
                "data-tag-name": "p",
                "data-class-name": "modifiedClass",
                "data-id": "modifiedId",
                "data-attributes": '{ "lang": "es", "title": "title from modified data attributes" }'
            };

            modifiedHtml = "This is the modified template <strong>markup</strong>.";

            View = Backbone.View.extend();

            // First access, priming the cache
            new View( { template: "#template" } );
            new View( { template: "#template2" } );
            new View( { template: "#template3" } );
        } );

        afterEach( function () {
            cleanup();
            $templateNode.remove();
            $templateNode2.remove();
            $templateNode3.remove();
        } );

        describe( 'The Marionette.TemplateCache.clear() method', function () {

            describe( 'when called with arguments', function () {

                it( 'clears a given template from the Marionette cache if the template string is a selector', function () {
                    // We test this by deleting the template node after first access, then clearing the cache.
                    // On second access, the invalid cache query should throw an error.
                    $templateNode.remove();
                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                } );

                it( 'clears a given template from the DeclarativeViews cache if the template string is a selector', function () {
                    // We test this by deleting the template node after first access, then clearing the cache.
                    // On second access, the cache should store the selector string itself (as the node no
                    // longer exists).
                    $templateNode.remove();
                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                } );

                it( 'allows changes made to the underlying template node to be picked up by Marionette', function () {
                    $templateNode
                        .attr( modifiedDataAttributes )
                        .html( modifiedHtml );

                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( modifiedHtml );
                } );

                it( 'allows changes made to the underlying template node to be picked up by Backbone.DeclarativeViews', function () {
                    $templateNode
                        .attr( modifiedDataAttributes )
                        .html( modifiedHtml );

                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( modifiedDataAttributes, $templateNode );
                } );

                it( 'clears multiple templates from the Marionette cache when the selectors are passed as multiple arguments', function () {
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear( "#template", "#template2", "#template3" );

                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template2" ) } ).to.throw( Error, 'Could not find template: "#template2"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template3" ) } ).to.throw( Error, 'Could not find template: "#template3"' );
                } );

                it( 'clears multiple templates from the DeclarativeViews cache when the selectors are passed as multiple arguments', function () {
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear( "#template", "#template2", "#template3" );

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
                } );

                it( 'clears multiple templates from the Marionette cache when the selectors are passed as an array', function () {
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear( [ "#template", "#template2", "#template3" ] );

                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template2" ) } ).to.throw( Error, 'Could not find template: "#template2"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template3" ) } ).to.throw( Error, 'Could not find template: "#template3"' );
                } );

                it( 'clears multiple templates from the DeclarativeViews cache when the selectors are passed as an array', function () {
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear( [ "#template", "#template2", "#template3" ] );

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
                } );

                it.skip( 'does not clear other templates from the Marionette cache', function () {
                    // Delete the template nodes so that their content indeed must come from the cache
                    //
                    // ATTN Skipped - Marionette is buggy, clears the whole cache (as of 2.4.1). This is not caused by
                    // the Marionette integration code of Backbone.Declarative.Views.
                    $templateNode2.remove();
                    $templateNode3.remove();

                    // Clear template #1 from the cache
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Check cache for template #2 and template #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );
                } );

                it( 'does not clear other templates from the DeclarativeViews cache', function () {
                    // Delete the template nodes so that their content indeed must come from the cache
                    $templateNode2.remove();
                    $templateNode3.remove();

                    // Clear template #1 from the cache
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Check cache for template #2 and template #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, $templateNode2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, $templateNode3 );
                } );

                it( 'fails silently if the template has already been removed from the cache', function () {
                    // Removing the template node, which is a precondition for verifying that the cache has indeed been
                    // cleared.
                    $templateNode.remove();

                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Second call, should go ahead without error
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Checking that the cache is still empty, and querying it throws the expected error for Marionette,
                    // and stores the selector string for Backbone.Declarative.Views (because the node no longer exists)
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                } );

                it( 'fails silently if the template is a string containing text which is not wrapped in HTML elements (uncacheable string), and leaves the existing cache intact', function () {
                    Backbone.Marionette.TemplateCache.clear( "This is plain text with some <strong>markup</strong>, but not wrapped in an element" );

                    // Check the Marionette cache for templates #1 through #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );

                    // Check the DeclarativeVies cache for templates #1 through #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, $templateNode );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, $templateNode2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, $templateNode3 );
                } );

                it( 'fails silently if the template is not a string, and leaves the existing cache intact', function () {
                    Backbone.Marionette.TemplateCache.clear( function () { return "<p>Template content</p>"; } );

                    // Check the Marionette cache for templates #1 through #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );

                    // Check the DeclarativeVies cache for templates #1 through #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, $templateNode );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, $templateNode2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, $templateNode3 );
                } );

                it( 'throws an error when called with an empty string argument', function () {
                    expect( function () { Backbone.Marionette.TemplateCache.clear( "" ); } ).to.throw( Error );
                } );

            } );

            describe( 'when called without arguments', function () {

                it( 'clears the entire Marionette cache', function () {
                    // We test this by deleting all template nodes after first access, then clearing the cache.
                    // On second access, the invalid cache query should throw an error.
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear();

                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template2" ) } ).to.throw( Error, 'Could not find template: "#template2"' );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template3" ) } ).to.throw( Error, 'Could not find template: "#template3"' );
                } );

                it( 'clears the entire DeclarativeViews cache', function () {
                    // We test this by deleting all template nodes after first access, then clearing the cache.
                    // On second access, the cache should store the selector string itself for each selector
                    // (as the node no longer exists).
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear();

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
                } );

            } );

        } );

    } );

})();