/*global describe, it */
(function () {
    "use strict";

    var View, view, baseTemplateHtml, $templateNode, dataAttributes, attributesAsProperties;

    describe( 'Cache access', function () {

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
        } );

        describe( 'The declarativeViews "namespace" property', function () {

            beforeEach( function () {
                view = new View();
            } );

            it( 'is available and is an object even if no template is specified', function () {
                expect( view ).to.have.a.property( "declarativeViews" );
                expect( view.declarativeViews ).to.be.an( "object" );
            } );

            it( 'is independent of the same property on another view', function () {
                var otherView = new View();
                expect( otherView.declarativeViews ).not.to.equal( view.declarativeViews );
            } );

        } );

        describe( 'The getCachedTemplate() method of a view', function () {

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#nonexistent" );
            };

            before ( cleanup );
            after ( cleanup );

            describe( 'returns a hash containing just a valid: false property', function () {

                it( 'if the template is not specified', function () {
                    view = new View();
                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

                it( 'if an empty string is passed in as the template', function () {
                    view = new View( { template: "" } );
                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but does not exist', function () {
                    view = new View( { template: "#nonexistent" } );
                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but is a function rather than a selector', function () {
                    View = Backbone.View.extend( { template: function () {
                        return "<article></article>";
                    } } );
                    view = new View();

                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but is a string containing text which is not wrapped in HTML elements', function () {
                    view = new View( { template: "This is plain text with some <strong>markup</strong>, but not wrapped in an element" } );
                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

            } );

            describe( 'with a template element specified by a selector', function () {

                beforeEach( function () {
                    view = new View( { template: "#template" } );
                } );


                it( 'returns a hash which is flagged as valid', function () {
                    expect( view.declarativeViews.getCachedTemplate() ).to.have.a.property( "valid", true );
                } );

                it( 'returns the el properties described in the template', function () {
                    var returnedElProperties = _.pick( view.declarativeViews.getCachedTemplate(), _.keys( attributesAsProperties ) );
                    expect( returnedElProperties ).to.eql( attributesAsProperties );
                } );

                it( 'returns the inner HTML of the template', function () {
                    expect( view.declarativeViews.getCachedTemplate().html ).to.equal( $templateNode.html() );
                } );

            } );

            describe( 'with a template element specified as a raw HTML string', function () {

                beforeEach( function () {
                    // Construct the HTML string
                    var templateHtml = $( baseTemplateHtml )
                        .attr( dataAttributes )
                        .prop( 'outerHTML' );

                    view = new View( { template: templateHtml } );
                } );

                it( 'returns a hash which is flagged as valid', function () {
                    expect( view.declarativeViews.getCachedTemplate() ).to.have.a.property( "valid", true );
                } );

                it( 'returns the el properties described in the template', function () {
                    var returnedElProperties = _.pick( view.declarativeViews.getCachedTemplate(), _.keys( attributesAsProperties ) );
                    expect( returnedElProperties ).to.eql( attributesAsProperties );
                } );

                it( 'returns the inner HTML of the template', function () {
                    expect( view.declarativeViews.getCachedTemplate().html ).to.equal( $templateNode.html() );
                } );

            } );

            describe( 'is already available in the initialize method of the view', function () {

                beforeEach( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                    View = Backbone.View.extend( {
                        initialize: function () {
                            this.cachedTemplate = this.declarativeViews.getCachedTemplate();
                        }
                    } );
                } );

                it( 'when the template is defined as a view property', function () {
                    View = View.extend( { template: "#template" } );
                    view = new View();

                    expect( view.cachedTemplate ).to.be.an( "object" );
                    expect( view.cachedTemplate.html ).to.equal( $templateNode.html() );
                } );

                it( 'when the template is passed in as an option', function () {
                    view = new View( { template: "#template" } );

                    expect( view.cachedTemplate ).to.be.an( "object" );
                    expect( view.cachedTemplate.html ).to.equal( $templateNode.html() );
                } );

            } );

            describe( 'indeed uses the cache and keeps a template accessible, unmodified', function () {

                var expected;

                beforeEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                    // First access, priming the cache
                    view = new View( { template: "#template" } );

                    expected = _.extend( { valid: true, html: $templateNode.html() }, attributesAsProperties );
                } );

                afterEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                } );

                it( 'if the underlying template node has been changed after first use', function () {
                    var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    };

                    $templateNode.attr( modifiedDataAttributes );
                    view = new View( { template: "#template" } );

                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
                } );

                it( 'even if the underlying template node has been deleted after first use', function () {
                    $templateNode.remove();
                    view = new View( { template: "#template" } );

                    expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
                } );
            } );

        } );

        describe( 'The Backbone.DeclarativeViews.getCachedTemplate() method', function () {

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#nonexistent" );
            };

            before ( cleanup );
            after ( cleanup );

            describe( 'returns a hash containing just a valid: false property', function () {

                it( 'if the template is not specified', function () {
                    expect( Backbone.DeclarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
                } );

                it( 'if an empty string is passed in as the template', function () {
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "" ) ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but does not exist', function () {
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#nonexistent" ) ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but is a function rather than a selector', function () {
                    var template = function () {
                        return "<article></article>";
                    };

                    expect( Backbone.DeclarativeViews.getCachedTemplate( template ) ).to.eql( { valid: false } );
                } );

                it( 'if the template is specified, but is a string containing text which is not wrapped in HTML elements', function () {
                    var template = "This is plain text with some <strong>markup</strong>, but not wrapped in an element";
                    expect( Backbone.DeclarativeViews.getCachedTemplate( template ) ).to.eql( { valid: false } );
                } );

            } );

            describe( 'with a template element specified by a selector', function () {

                var retrieved;

                beforeEach( function () {
                    retrieved = Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                } );

                it( 'returns a hash which is flagged as valid', function () {
                    expect( retrieved ).to.have.a.property( "valid", true );
                } );

                it( 'returns the el properties described in the template', function () {
                    var returnedElProperties = _.pick( retrieved, _.keys( attributesAsProperties ) );
                    expect( returnedElProperties ).to.eql( attributesAsProperties );
                } );

                it( 'returns the inner HTML of the template', function () {
                    expect( retrieved.html ).to.equal( $templateNode.html() );
                } );

            } );

            describe( 'with a template element specified as a raw HTML string', function () {

                var retrieved;

                beforeEach( function () {
                    // Construct the HTML string
                    var templateHtml = $( baseTemplateHtml )
                        .attr( dataAttributes )
                        .prop( 'outerHTML' );

                    retrieved = Backbone.DeclarativeViews.getCachedTemplate( templateHtml );
                } );

                it( 'returns a hash which is flagged as valid', function () {
                    expect( retrieved ).to.have.a.property( "valid", true );
                } );

                it( 'returns the el properties described in the template', function () {
                    var returnedElProperties = _.pick( retrieved, _.keys( attributesAsProperties ) );
                    expect( returnedElProperties ).to.eql( attributesAsProperties );
                } );

                it( 'returns the inner HTML of the template', function () {
                    expect( retrieved.html ).to.equal( $templateNode.html() );
                } );

            } );

            describe( 'returns the results hash', function () {

                var expected;

                beforeEach( function () {
                    expected = _.extend( { valid: true, html: $templateNode.html() }, attributesAsProperties  )
                } );

                it( 'if the cache is still empty', function () {
                    Backbone.DeclarativeViews.clearCache();
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                } );

                it( 'if the cache is already primed with the requested template', function () {
                    view = new View( { template: "#template" } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                } );

            } );

            describe( 'indeed uses the cache and keeps a template accessible, unmodified', function () {

                var expected;

                beforeEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                    // First access, priming the cache
                    view = new View( { template: "#template" } );

                    expected = _.extend( { valid: true, html: $templateNode.html() }, attributesAsProperties );
                } );

                afterEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                } );

                it( 'if the underlying template node has been changed after first use', function () {
                    var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    };

                    $templateNode.attr( modifiedDataAttributes );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                } );

                it( 'even if the underlying template node has been deleted after first use', function () {
                    $templateNode.remove();
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                } );
            } );

        } );

        describe( 'The clearCachedTemplate() method of a view', function () {

            // NB We don't test if the method clears a given template from the cache if the template string consists of
            // raw HTML.
            //
            // That's because it can't really be tested. After deletion, when the cache is queried for that raw HTML
            // string, it automatically gets recreated. The return value is the same, whether the result came from an
            // existing cache entry or from the fresh input.
            //
            // (For selector strings, that is different. If the template node is deleted when the cache is empty, the
            // original template _won't_ be recreated.)

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );
            };

            beforeEach ( function () {
                cleanup();

                // First access, priming the cache
                view = new View( { template: "#template" } );
            } );

            afterEach( cleanup );

            it( 'clears a given template from the cache if the template string is a selector', function () {
                // We test this by deleting the template node after first access, then clearing the cache.
                // On second access, the cache should return { valid: false } for the selector.
                $templateNode.remove();
                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
            } );

            it( 'allows changes made to the underlying template node to be picked up', function () {
                var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    },

                    expected = _.extend(
                        dataAttributesToProperties( modifiedDataAttributes ),
                        { valid: true, html: $templateNode.html() }
                    );

                $templateNode.attr( modifiedDataAttributes );

                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
            } );

            it( 'allows changes made to the underlying template node to be picked up, properly handling the deletion of data-* attributes with string values', function () {
                // We test that these values are set to undefined when queried again from the cache.

                var modifiedDataAttributes = {
                        "data-id": "modifiedId"
                    },

                    expected = {
                        tagName: undefined,
                        className: undefined,
                        id: "modifiedId",
                        attributes: { lang: "en", title: "title from data attributes" },
                        html: $templateNode.html(),
                        valid: true
                    };

                $templateNode
                    .attr( modifiedDataAttributes )
                    .removeAttr( "data-tag-name" )
                    .removeAttr( "data-class-name" );

                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
            } );

            it( 'allows changes made to the underlying template node to be picked up, properly handling a deleted `data-attributes` attribute', function () {
                // The data-attributes attribute is of particular interest because it is a JSON string which must be
                // parsed.
                //
                // When re-reading it after the cache has been cleared, the parsing should not blow up with an error
                // just because the attribute suddenly doesn't exist and evaluates to undefined.

                var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId"
                    },

                    expected = {
                        tagName: "li",
                        className: "modifiedClass",
                        id: "modifiedId",
                        attributes: undefined,
                        html: $templateNode.html(),
                        valid: true
                    };

                $templateNode
                    .attr( modifiedDataAttributes )
                    .removeAttr( "data-attributes" );

                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
            } );

            it( 'does not clear other templates from the cache', function () {
                var genericTemplateTag = '<script type="text/x-template"></script>',

                    dataAttributes2 = {
                        "data-tag-name": "li",
                        "data-class-name": "dataClass2",
                        "data-id": "dataId2",
                        "data-attributes": '{ "lang": "fr", "title": "title from data attributes 2" }'
                    },

                    dataAttributes3 = {
                        "data-tag-name": "nav",
                        "data-class-name": "dataClass3",
                        "data-id": "dataId3",
                        "data-attributes": '{ "lang": "de", "title": "title from data attributes 3" }'
                    },

                    $templateNode2 = $( genericTemplateTag )
                        .attr( "id", "template2" )
                        .attr( dataAttributes2 )
                        .text( "Content of template #2" )
                        .appendTo( "body" ),

                    $templateNode3 = $( genericTemplateTag )
                        .attr( "id", "template3" )
                        .attr( dataAttributes3 )
                        .text( "Content of template #3" )
                        .appendTo( "body" ),

                    expected2 = _.extend(
                        dataAttributesToProperties( dataAttributes2 ),
                        { valid: true, html: $templateNode2.html() }
                    ),

                    expected3 = _.extend(
                        dataAttributesToProperties( dataAttributes3 ),
                        { valid: true, html: $templateNode3.html() }
                    );

                // Prime the cache with the additional templates (template #1 has already been cached in beforeEach)
                new View( { template: "#template2" } );
                new View( { template: "#template3" } );

                // Delete the template nodes so that their content indeed must come from the cache
                $templateNode2.remove();
                $templateNode3.remove();

                // Clear template #1 from the cache
                view.declarativeViews.clearCachedTemplate();

                // Check cache for template #2 and template #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
            } );

            it( 'fails silently if the template has already been removed from the cache', function () {
                // Removing the template node, which is a precondition for verifying that the cache has indeed been
                // cleared.
                $templateNode.remove();

                view.declarativeViews.clearCachedTemplate();

                // Second call, should go ahead without error
                view.declarativeViews.clearCachedTemplate();

                // Checking that the cache is still empty, and querying it returns the expected placeholder hash
                expect( view.declarativeViews.getCachedTemplate() ).to.eql( { valid: false } );
            } );

        } );

        describe( 'The Backbone.DeclarativeViews.clearCachedTemplate() method', function () {

            // NB We don't test if the method clears a given template from the cache if the template string consists of
            // raw HTML.
            //
            // That's because it can't really be tested. After deletion, when the cache is queried for that raw HTML
            // string, it automatically gets recreated. The return value is the same, whether the result came from an
            // existing cache entry or from the fresh input.
            //
            // (For selector strings, that is different. If the template node is deleted when the cache is empty, the
            // original template _won't_ be recreated.)

            var dataAttributes2, dataAttributes3, $templateNode2, $templateNode3,
                cleanup = function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );
                };

            beforeEach ( function () {
                cleanup();

                var genericTemplateTag = '<script type="text/x-template"></script>';

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

            it( 'clears a given template from the cache if the template string is a selector', function () {
                // We test this by deleting the template node after first access, then clearing the cache.
                // On second access, the cache should return { valid: false } for the selector.
                $templateNode.remove();
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
            } );

            it( 'allows changes made to the underlying template node to be picked up', function () {
                var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    },

                    expected = _.extend(
                        dataAttributesToProperties( modifiedDataAttributes ),
                        { valid: true, html: $templateNode.html() }
                    );

                $templateNode.attr( modifiedDataAttributes );

                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
            } );

            it( 'clears multiple templates from the cache when the selectors are passed as multiple arguments', function () {
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
            } );

            it( 'clears multiple templates from the cache when the selectors are passed as an array', function () {
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( [ "#template", "#template2", "#template3" ] );

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
            } );

            it( 'does not clear other templates from the cache', function () {
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
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Check cache for template #2 and template #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
            } );

            it( 'fails silently if the template has already been removed from the cache', function () {
                // Removing the template node, which is a precondition for verifying that the cache has indeed been
                // cleared.
                $templateNode.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Second call, should go ahead without error
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Checking that the cache is still empty, and querying it returns the expected placeholder hash
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

                Backbone.DeclarativeViews.clearCachedTemplate( "This is plain text with some <strong>markup</strong>, but not wrapped in an element" );

                // Check cache for templates #1 through #3 - still there?
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

                Backbone.DeclarativeViews.clearCachedTemplate( function () { return "<p>Template content</p>"; } );

                // Check cache for templates #1 through #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( expected );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( expected2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( expected3 );
            } );

            it( 'throws an error when called without arguments', function () {
                expect( function () { Backbone.DeclarativeViews.clearCachedTemplate(); } ).to.throw( Error );
            } );

            it( 'throws an error when called with an empty string argument', function () {
                expect( function () { Backbone.DeclarativeViews.clearCachedTemplate( "" ); } ).to.throw( Error );
            } );

        } );

        describe( 'The Backbone.DeclarativeViews.clearCache() method', function () {

            var dataAttributes2, dataAttributes3, $templateNode2, $templateNode3,
                cleanup = function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );
                };

            beforeEach ( function () {
                cleanup();

                var genericTemplateTag = '<script type="text/x-template"></script>';

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

            it( 'clears the entire cache', function () {
                // We test this by deleting all template nodes after first access, then clearing the cache.
                // On second access, the cache should return { valid: false } for each selector.
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCache();

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.eql( { valid: false } );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.eql( { valid: false } );
            } );

        } );

    } );

})();