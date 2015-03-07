/*global describe, it */
(function () {
    "use strict";

    // These tests require that full Marionette integration is active, ie that marionette.declarativeviews.integration.js
    // is loaded.

    describe( 'Integrated cache access of Marionette and Backbone.Declarative.Views', function () {

        var View, baseTemplateHtml, $templateNode, dataAttributes, attributesAsProperties;

        beforeEach( function () {

            baseTemplateHtml = '<script id="template" type="text/x-template">This is the template <strong>markup</strong>.</script>';

            dataAttributes = {
                "data-tag-name": "section",
                "data-class-name": "dataClass",
                "data-id": "dataId",
                "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
            };

            // Equivalent of the data attributes as a hash of el properties. Written out for clarity, but could simply
            // have been transformed with the test helper function dataAttributesToProperties( dataAttributes ).
            attributesAsProperties = {
                tagName: "section",
                className: "dataClass",
                id: "dataId",
                attributes: { lang: "en", title: "title from data attributes" }
            };

            $templateNode = $( baseTemplateHtml ).appendTo( "body" );
            $templateNode.attr( dataAttributes );

            View = Backbone.View.extend();

        } );

        afterEach( function () {
            $templateNode.remove();
        } );

        after( function () {
            Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
            Backbone.Marionette.TemplateCache.clear( "#template" );
        } );

        describe( 'Full Marionette integration is signalled by the _marionetteIntegration flag', function () {

            it( 'which is set to true', function () {
                expect( Backbone.DeclarativeViews._marionetteIntegration ).to.be.true;
            } );

        } );

        describe( 'The Backbone.Marionette.TemplateCache.get() method', function () {

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#nonexistent" );
                Backbone.Marionette.TemplateCache.clear( "#template", "#nonexistent" );
            };

            before ( cleanup );
            after ( cleanup );

            describe( 'throws an error', function () {

                it( 'if the template is not specified', function () {
                    expect( function () { Backbone.Marionette.TemplateCache.get() } ).to.throw( Error, 'Could not find template: "undefined"' );
                } );

                it( 'if an empty string is passed in as the template', function () {
                    expect( function () { Backbone.Marionette.TemplateCache.get( "" ) } ).to.throw( Error, 'Could not find template: ""' );
                } );

                it( 'if the template is specified, but does not exist', function () {
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#nonexistent" ) } ).to.throw( Error, 'Could not find template: "#nonexistent"' );
                } );

                it( 'if the template is specified, but is a function rather than a selector', function () {
                    var template = function () {
                        return "<article></article>";
                    };
                    expect( function () { Backbone.Marionette.TemplateCache.get( template ) } ).to.throw( Error, 'Could not find template: "' + template + '"' );
                } );

                it( 'if the template is specified, but is a string containing text which is not wrapped in HTML elements', function () {
                    var template = "This is plain text with some <strong>markup</strong>, but not wrapped in an element";
                    expect( function () { Backbone.Marionette.TemplateCache.get( template ) } ).to.throw( Error, 'Could not find template: "' + template + '"' );
                } );

            } );

            describe( 'with a template element specified by a selector', function () {

                var retrieved;

                beforeEach( function () {
                    retrieved = Backbone.Marionette.TemplateCache.get( "#template" );
                } );

                it( 'returns a function...', function () {
                    expect( retrieved ).to.be.a( "function" );
                } );

                it( '...with a return value that matches the inner HTML of the template', function () {
                    expect( retrieved() ).to.equal( $templateNode.html() );
                } );

                it( 'indeed stores it in the Marionette cache', function () {
                    // We test this by deleting the template node once the cache is primed, then check if we can still
                    // retrieve the data.
                    var expected = $templateNode.html();
                    $templateNode.remove();
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( expected );
                } );

                it( 'stores the template in the DeclarativeViews cache as well', function () {
                    // We need to delete the template node before querying the DeclarativeViews cache, otherwise the
                    // cache would be primed by the query itself in any event.
                    var expected = _.extend( { valid: true, html: $templateNode.html() }, attributesAsProperties );
                    $templateNode.remove();
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                } );

            } );

            describe( 'with a template element specified as a raw HTML string', function () {

                var retrieved;

                beforeEach( function () {
                    // Construct the HTML string
                    var templateHtml = $( baseTemplateHtml )
                        .attr( dataAttributes )
                        .prop( 'outerHTML' );

                    retrieved = Backbone.Marionette.TemplateCache.get( templateHtml );
                } );

                it( 'returns a function...', function () {
                    expect( retrieved ).to.be.a( "function" );
                } );

                it( '...with a return value that matches the inner HTML of the template', function () {
                    expect( retrieved() ).to.equal( $templateNode.html() );
                } );

                // NB We don't test the cases
                // - "it indeed stores it in the Marionette cache"
                // - "it stores the template in the DeclarativeViews cache as well"
                // because we can't. Querying the caches of Marionette and DeclarativeViews would prime them anyway.

            } );

            describe( 'returns the compiled template', function () {

                it( 'if the cache is still empty', function () {
                    Backbone.DeclarativeViews.clearCache();
                    Backbone.Marionette.TemplateCache.clear();
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                } );

                it( 'if the cache is already primed with the requested template', function () {
                    new View( { template: "#template" } );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                } );

            } );

        } );

        describe( 'The Marionette.TemplateCache.clear() method', function () {

            var modifiedDataAttributes, modifiedHtml, dataAttributes2, dataAttributes3, $templateNode2, $templateNode3,
                cleanup = function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );
                    Backbone.Marionette.TemplateCache.clear( "#template", "#template2", "#template3" );
                };

            beforeEach ( function () {
                cleanup();

                var genericTemplateTag = '<script type="text/x-template"></script>';

                modifiedDataAttributes = {
                    "data-tag-name": "p",
                    "data-class-name": "modifiedClass",
                    "data-id": "modifiedId",
                    "data-attributes": '{ "lang": "es", "title": "title from modified data attributes" }'
                };

                modifiedHtml = "This is the modified template <strong>markup</strong>.";

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

                // First access, priming the cache
                new View( { template: "#template" } );
                new View( { template: "#template2" } );
                new View( { template: "#template3" } );
            } );

            afterEach( function () {
                cleanup();
                $templateNode2.remove();
                $templateNode3.remove();
            } );

            describe( 'when called with arguments', function () {

                it( 'clears a given template from the Marionette cache if the template string is a selector', function () {
                    // We test this by deleting the template node after first access, then clearing the cache.
                    // On second access, the cache should return { valid: false } for the selector.
                    $templateNode.remove();
                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                } );

                it( 'clears a given template from the DeclarativeViews cache if the template string is a selector', function () {
                    // We test this by deleting the template node after first access, then clearing the cache.
                    // On second access, the cache should return { valid: false } for the selector.
                    $templateNode.remove();
                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                } );

                it( 'allows changes made to the underlying template node to be picked up by Marionette', function () {
                    $templateNode
                        .attr( modifiedDataAttributes )
                        .html( modifiedHtml );

                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( modifiedHtml );
                } );

                it( 'allows changes made to the underlying template node to be picked up by Backbone.DeclarativeViews', function () {
                    var expected = _.extend(
                        dataAttributesToProperties( modifiedDataAttributes ),
                        { valid: true, html: modifiedHtml }
                    );

                    $templateNode
                        .attr( modifiedDataAttributes )
                        .html( modifiedHtml );

                    Backbone.Marionette.TemplateCache.clear( "#template" );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
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

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
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

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
                } );

                it( 'does not clear other templates from the Marionette cache', function () {
                    // Delete the template nodes so that their content indeed must come from the cache
                    $templateNode2.remove();
                    $templateNode3.remove();

                    // Clear template #1 from the cache
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Check cache for template #2 and template #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );
                } );

                it( 'does not clear other templates from the DeclarativeViews cache', function () {
                    var expected2 = _.extend(
                            dataAttributesToProperties( dataAttributes2 ),
                            { valid: true, html: $templateNode2.html() }
                        ),

                        expected3 = _.extend(
                            dataAttributesToProperties( dataAttributes3 ),
                            { valid: true, html: $templateNode3.html() }
                        );

                    // Delete the template nodes so that their content indeed must come from the cache
                    $templateNode2.remove();
                    $templateNode3.remove();

                    // Clear template #1 from the cache
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Check cache for template #2 and template #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
                } );

                it( 'fails silently if the template has already been removed from the cache', function () {
                    // Removing the template node, which is a precondition for verifying that the cache has indeed been
                    // cleared.
                    $templateNode.remove();

                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Second call, should go ahead without error
                    Backbone.Marionette.TemplateCache.clear( "#template" );

                    // Checking that the cache is still empty, and querying it returns the expected error/placeholder hash
                    expect( function () { Backbone.Marionette.TemplateCache.get( "#template" ) } ).to.throw( Error, 'Could not find template: "#template"' );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                } );

                it( 'fails silently if the template is a string containing text which is not wrapped in HTML elements (uncacheable string), and leaves the existing cache intact', function () {
                    // Set expectations for the existing templates first - they must remain intact in the cache
                    var expected = _.extend(
                            dataAttributesToProperties( dataAttributes ),
                            { valid: true, html: $templateNode.html() }
                        ),

                        expected2 = _.extend(
                            dataAttributesToProperties( dataAttributes2 ),
                            { valid: true, html: $templateNode2.html() }
                        ),

                        expected3 = _.extend(
                            dataAttributesToProperties( dataAttributes3 ),
                            { valid: true, html: $templateNode3.html() }
                        );

                    Backbone.Marionette.TemplateCache.clear( "This is plain text with some <strong>markup</strong>, but not wrapped in an element" );

                    // Check the Marionette cache for templates #1 through #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );

                    // Check the DeclarativeVies cache for templates #1 through #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
                } );

                it( 'fails silently if the template is not a string, and leaves the existing cache intact', function () {
                    // Set expectations for the existing templates first - they must remain intact in the cache
                    var expected = _.extend(
                            dataAttributesToProperties( dataAttributes ),
                            { valid: true, html: $templateNode.html() }
                        ),

                        expected2 = _.extend(
                            dataAttributesToProperties( dataAttributes2 ),
                            { valid: true, html: $templateNode2.html() }
                        ),

                        expected3 = _.extend(
                            dataAttributesToProperties( dataAttributes3 ),
                            { valid: true, html: $templateNode3.html() }
                        );

                    Backbone.Marionette.TemplateCache.clear( function () { return "<p>Template content</p>"; } );

                    // Check the Marionette cache for templates #1 through #3 - still there?
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.eql( $templateNode.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template2" ) )() ).to.eql( $templateNode2.html() );
                    expect( ( Backbone.Marionette.TemplateCache.get( "#template3" ) )() ).to.eql( $templateNode3.html() );

                    // Check the DeclarativeVies cache for templates #1 through #3 - still there?
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
                } );

                it( 'throws an error when called with an empty string argument', function () {
                    expect( function () { Backbone.Marionette.TemplateCache.clear( "" ); } ).to.throw( Error );
                } );

            } );

            describe( 'when called without arguments', function () {

                it( 'clears the entire Marionette cache', function () {
                    // We test this by deleting all template nodes after first access, then clearing the cache.
                    // On second access, the cache should return { valid: false } for each selector.
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
                    // On second access, the cache should return { valid: false } for each selector.
                    $templateNode.remove();
                    $templateNode2.remove();
                    $templateNode3.remove();

                    Backbone.Marionette.TemplateCache.clear();

                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
                } );

            } );

        } );

    } );

})();