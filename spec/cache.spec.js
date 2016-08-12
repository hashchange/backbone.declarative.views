/*global describe, it */
(function () {
    "use strict";

    var View, view, baseTemplateHtml, $templateNode, dataAttributes, attributesAsProperties, undefinedProperties,

        rawHtmlScenarios = {

            templateComplexity: {
                "and a simple template being passed in": function ( templateLanguage, insertion ) { return '<li class="bullet">' + insertion + '</li>'; },
                "and a complex template being passed in": function ( templateLanguage, insertion ) { return createComplexTemplate( templateLanguage, { insertion: insertion } ); }
            },

            templateLanguage: {
                "in Handlebars syntax": "Handlebars",
                "in EJS syntax": "EJS",
                "in ES6 syntax": "ES6"
            },

            commentConfig: {
                "with the el properties in a single-line comment": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes );
                    }
                },
                "with the el properties in a single-line comment, in reverse order": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes, { reverse: true } );
                    }
                },
                "with the el properties in a single-line comment, with redundant space inside attribute assignments": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes, { extraSpace: "   " } );
                    }
                },
                "with the el properties in a single-line comment, using single quotes around values": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes, { preferSingleQuotes: true } );
                    }
                },
                "with the el properties in a multi-line comment": {
                    createContent: function ( dataAttributes ) {
                        return "\n" + attributesHashToString( dataAttributes, { multiline: true } );
                    }
                },
                "with the el properties in a multi-line comment, in reverse order": {
                    createContent: function ( dataAttributes ) {
                        return "\n" + attributesHashToString( dataAttributes, { multiline: true, reverse: true } );
                    }
                },
                "with the el properties in a multi-line comment, with redundant space and line breaks inside attribute assignments": {
                    createContent: function ( dataAttributes ) {
                        return "\n" + attributesHashToString( dataAttributes, { multiline: true, extraSpace: "   \n  " } );
                    }
                },
                "with the el properties in a multi-line comment, using single quotes around values": {
                    createContent: function ( dataAttributes ) {
                        return "\n" + attributesHashToString( dataAttributes, { multiline: true, preferSingleQuotes: true } );
                    }
                },
                "with the el properties in a comment containing additional text": {
                    createContent: function ( dataAttributes ) {
                        return "lorem ipsum dolor sit amet" + attributesHashToString( dataAttributes ) + "lorem ipsum dolor sit amet";
                    }
                },
                // NB el properties at the beginning of the template is the test scenario default, no need to test again
                "with the el properties in a comment at the end of the template": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes );
                    },
                    trailing: true
                },
                "with the el properties in a comment somewhere in the middle of the template": {
                    createContent: function ( dataAttributes ) {
                        return attributesHashToString( dataAttributes );
                    },
                    among: true
                },
                "without el properties being defined in a comment": {
                    noComment: true
                }
            }

        };

    describe( 'Cache access', function () {

        beforeEach( function () {

            baseTemplateHtml = '<script id="template" type="text/x-template">This is the template <strong>markup</strong>.</script>';

            dataAttributes = {
                "data-tag-name": "section",
                "data-class-name": "dataClass",
                "data-id": "dataId",
                "data-attributes": '{ "lang": "en", "title": "title from data attributes", "contenteditable": "" }'
            };

            // Equivalent of the data attributes as a hash of el properties. Written out for clarity, but could simply
            // have been transformed with the test helper function dataAttributesToProperties( dataAttributes ).
            attributesAsProperties = {
                tagName: "section",
                className: "dataClass",
                id: "dataId",
                attributes: { lang: "en", title: "title from data attributes", contenteditable: "" }
            };

            undefinedProperties = {
                tagName: undefined,
                className: undefined,
                id: undefined,
                attributes: undefined
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

            describe( 'returns undefined', function () {

                it( 'if the template is not specified', function () {
                    view = new View();
                    expect( view.declarativeViews.getCachedTemplate() ).to.be.undefined;
                } );

                it( 'if an empty string is passed in as the template', function () {
                    view = new View( { template: "" } );
                    expect( view.declarativeViews.getCachedTemplate() ).to.be.undefined;
                } );

                it( 'if the template is specified, but is a function rather than a selector', function () {
                    View = Backbone.View.extend( { template: function () {
                        return "<article></article>";
                    } } );
                    view = new View();

                    expect( view.declarativeViews.getCachedTemplate() ).to.be.undefined;
                } );

            } );

            describe( 'stores the input string as the template', function () {

                it( 'if the template is specified with a selector, but does not exist', function () {
                    var selector = "#nonexistent";

                    view = new View( { template: selector } );
                    expect( view.declarativeViews.getCachedTemplate().html ).to.equal( selector );
                } );

                it( 'if the template is specified with a string containing text which is not wrapped in HTML elements', function () {
                    var templateString = "This is plain text with some <strong>markup</strong>, but not wrapped in an element";

                    view = new View( { template: templateString } );
                    expect( view.declarativeViews.getCachedTemplate().html ).to.equal( templateString );
                } );

            } );

            describe( 'with a template element specified by a selector', function () {

                beforeEach( function () {
                    view = new View( { template: "#template" } );
                } );

                it( 'returns an object', function () {
                    expect( view.declarativeViews.getCachedTemplate() ).to.be.an( "object" );
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

                var templateHtml;

                describeWithData( rawHtmlScenarios.templateComplexity, function ( createTemplateFn ) {

                    describeWithData( rawHtmlScenarios.templateLanguage, function ( templateLanguage ) {

                        describeWithData( rawHtmlScenarios.commentConfig, function ( elCommentConfig ) {

                            beforeEach( function () {
                                // Construct the HTML string
                                templateHtml = createRawHtml( createTemplateFn, templateLanguage, elCommentConfig, dataAttributes );

                                view = new View( { template: templateHtml } );
                            } );

                            it( 'returns an object', function () {
                                expect( view.declarativeViews.getCachedTemplate() ).to.be.an( "object" );
                            } );

                            it( 'returns the el properties described in the template', function () {
                                // If no el properties are described, the properties must not be found (hash with
                                // undefined values)
                                var returnedElProperties = _.pick( view.declarativeViews.getCachedTemplate(), _.keys( attributesAsProperties ) ),
                                    expected = elCommentConfig.noComment ? undefinedProperties : attributesAsProperties;

                                expect( returnedElProperties ).to.eql( expected );
                            } );

                            it( 'returns the inner HTML of the template', function () {
                                expect( view.declarativeViews.getCachedTemplate().html ).to.equal( templateHtml );
                            } );

                        } );

                    } );

                } );

            } );

            describe( 'is already available in the initialize method of the view', function () {

                beforeEach( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                    View = Backbone.View.extend( {
                        initialize: function () {
                            this.cachedTemplate = _.clone( this.declarativeViews.getCachedTemplate() );
                        }
                    } );
                } );

                it( 'when the template is defined as a view property', function () {
                    View = View.extend( { template: "#template" } );
                    view = new View();

                    expect( view.cachedTemplate ).to.returnCacheValueFor( dataAttributes, $templateNode );
                } );

                it( 'when the template is passed in as an option', function () {
                    view = new View( { template: "#template" } );
                    expect( view.cachedTemplate ).to.returnCacheValueFor( dataAttributes, $templateNode );
                } );

            } );

            describe( 'indeed uses the cache and keeps a template accessible, unmodified', function () {

                var origOuterHtml;

                beforeEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                    origOuterHtml = $templateNode.prop( "outerHTML" );

                    // First access, priming the cache
                    view = new View( { template: "#template" } );
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

                    expect( view.declarativeViews.getCachedTemplate() ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
                } );

                it( 'even if the underlying template node has been deleted after first use', function () {
                    $templateNode.remove();
                    view = new View( { template: "#template" } );

                    expect( view.declarativeViews.getCachedTemplate() ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
                } );
            } );

        } );

        describe( 'The Backbone.DeclarativeViews.getCachedTemplate() method', function () {

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#nonexistent" );
            };

            before ( cleanup );
            after ( cleanup );

            describe( 'returns undefined', function () {

                it( 'if the template is not specified', function () {
                    expect( Backbone.DeclarativeViews.getCachedTemplate() ).to.be.undefined;
                } );

                it( 'if an empty string is passed in as the template', function () {
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "" ) ).to.be.undefined;
                } );

                it( 'if the template is specified, but is a function rather than a selector', function () {
                    var template = function () {
                        return "<article></article>";
                    };

                    expect( Backbone.DeclarativeViews.getCachedTemplate( template ) ).to.be.undefined;
                } );

            } );

            describe( 'stores the input string as the template', function () {

                it( 'if the template is specified with a selector, but does not exist', function () {
                    var selector = "#nonexistent";
                    expect( Backbone.DeclarativeViews.getCachedTemplate( selector ).html ).to.equal( selector );
                } );

                it( 'if the template is specified with a string containing text which is not wrapped in HTML elements', function () {
                    var template = "This is plain text with some <strong>markup</strong>, but not wrapped in an element";
                    expect( Backbone.DeclarativeViews.getCachedTemplate( template ).html ).to.equal( template );
                } );

            } );

            describe( 'with a template element specified by a selector', function () {

                var retrieved;

                beforeEach( function () {
                    retrieved = Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                } );

                it( 'returns an object', function () {
                    expect( retrieved ).to.be.an( "object" );
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

                var templateHtml, retrieved;

                describeWithData( rawHtmlScenarios.templateComplexity, function ( createTemplateFn ) {

                    describeWithData( rawHtmlScenarios.templateLanguage, function ( templateLanguage ) {

                        describeWithData( rawHtmlScenarios.commentConfig, function ( elCommentConfig ) {

                            beforeEach( function () {
                                // Construct the HTML string
                                templateHtml = createRawHtml( createTemplateFn, templateLanguage, elCommentConfig, dataAttributes );
                                // Create cache entry
                                retrieved = Backbone.DeclarativeViews.getCachedTemplate( templateHtml );
                            } );

                            it( 'returns an object', function () {
                                expect( retrieved ).to.be.an( "object" );
                            } );

                            it( 'returns the el properties described in the template', function () {
                                // If no el properties are described, the properties must not be found (hash with
                                // undefined values)
                                var returnedElProperties = _.pick( retrieved, _.keys( attributesAsProperties ) ),
                                    expected = elCommentConfig.noComment ? undefinedProperties : attributesAsProperties;

                                expect( returnedElProperties ).to.eql( expected );
                            } );

                            it( 'returns the inner HTML of the template', function () {
                                expect( retrieved.html ).to.equal( templateHtml );
                            } );

                        } );

                    } );

                } );

            } );

            describe( 'returns the results hash', function () {

                var expected;

                beforeEach( function () {
                    expected = _.extend( { html: $templateNode.html() }, attributesAsProperties  )
                } );

                it( 'if the cache is still empty', function () {
                    Backbone.DeclarativeViews.clearCache();
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, $templateNode );
                } );

                it( 'if the cache is already primed with the requested template', function () {
                    view = new View( { template: "#template" } );
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, $templateNode );;
                } );

            } );

            describe( 'indeed uses the cache and keeps a template accessible, unmodified', function () {

                var origOuterHtml;

                beforeEach ( function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                    origOuterHtml = $templateNode.prop( "outerHTML" );

                    // First access, priming the cache
                    view = new View( { template: "#template" } );
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
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
                } );

                it( 'even if the underlying template node has been deleted after first use', function () {
                    $templateNode.remove();
                    expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).returnCacheValueFor( dataAttributes, origOuterHtml );
                } );
            } );

        } );

        describe( 'The clearCachedTemplate() method of a view', function () {

            var selector;

            // NB We don't test if the method clears a given template from the cache if the template string consists of
            // raw HTML.
            //
            // That's because it can't really be tested. After deletion, when the cache is queried for that raw HTML
            // string, it automatically gets recreated. The return value is the same, whether the result came from an
            // existing cache entry or from the fresh input.
            //
            // (For selector strings, that is different. If the template node is deleted once the cache is empty, the
            // original template _can't_ be recreated.)

            var cleanup = function () {
                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );
            };

            beforeEach ( function () {
                cleanup();

                // First access, priming the cache
                selector = "#template";
                view = new View( { template: selector } );
            } );

            afterEach( cleanup );

            it( 'clears a given template from the cache if the template string is a selector', function () {
                // We test this by deleting the template node after first access, then clearing the cache.
                // On second access, the cache should store the selector string itself (as the node no
                // longer exists).
                $templateNode.remove();
                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate().html ).to.equal( selector );
            } );

            it( 'allows changes made to the underlying template node to be picked up', function () {
                var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    };

                $templateNode.attr( modifiedDataAttributes );

                view.declarativeViews.clearCachedTemplate();
                expect( view.declarativeViews.getCachedTemplate() ).to.returnCacheValueFor( modifiedDataAttributes, $templateNode );
            } );

            it( 'allows changes made to the underlying template node to be picked up, properly handling the deletion of data-* attributes with string values', function () {
                // We test that these values are set to undefined when queried again from the cache.

                var retrieved,

                    modifiedDataAttributes = {
                        "data-id": "modifiedId"
                    },

                    resultingDataAttributes = {
                        "data-tag-name": undefined,
                        "data-class-name": undefined,
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "en", "title": "title from data attributes", "contenteditable": "" }'
                    };

                $templateNode
                    .attr( modifiedDataAttributes )
                    .removeAttr( "data-tag-name" )
                    .removeAttr( "data-class-name" );

                view.declarativeViews.clearCachedTemplate();

                retrieved = view.declarativeViews.getCachedTemplate();

                expect( retrieved ).to.have.ownProperty( "tagName" );
                expect( retrieved.tagName ).to.be.undefined;

                expect( retrieved ).to.have.ownProperty( "className" );
                expect( retrieved.className ).to.be.undefined;

                expect( retrieved ).to.returnCacheValueFor( resultingDataAttributes, $templateNode );
            } );

            it( 'allows changes made to the underlying template node to be picked up, properly handling a deleted `data-attributes` attribute', function () {
                // The data-attributes attribute is of particular interest because it is a JSON string which must be
                // parsed.
                //
                // When re-reading it after the cache has been cleared, the parsing should not blow up with an error
                // just because the attribute suddenly doesn't exist and evaluates to undefined.

                var retrieved,

                    modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId"
                    },

                    resultingDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": undefined
                    };

                $templateNode
                    .attr( modifiedDataAttributes )
                    .removeAttr( "data-attributes" );

                view.declarativeViews.clearCachedTemplate();

                retrieved = view.declarativeViews.getCachedTemplate();
                expect( retrieved ).to.have.ownProperty( "attributes", undefined );
                expect( retrieved ).to.returnCacheValueFor( resultingDataAttributes, $templateNode );
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
                        .appendTo( "body" );

                // Prime the cache with the additional templates (template #1 has already been cached in beforeEach)
                new View( { template: "#template2" } );
                new View( { template: "#template3" } );

                // Delete the template nodes so that their content indeed must come from the cache
                $templateNode2.remove();
                $templateNode3.remove();

                // Clear template #1 from the cache
                view.declarativeViews.clearCachedTemplate();

                // Check cache for template #2 and template #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, $templateNode2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, $templateNode3 );
            } );

            it( 'fails silently if the template has already been removed from the cache', function () {
                // Removing the template node, which is a precondition for verifying that the cache has indeed been
                // cleared.
                $templateNode.remove();

                view.declarativeViews.clearCachedTemplate();

                // Second call, should go ahead without error
                view.declarativeViews.clearCachedTemplate();

                // Checking that the cache is still empty, and querying it now stores the selector string (because the
                // selector doesn't match anything)
                expect( view.declarativeViews.getCachedTemplate().html ).to.equal( selector );
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
            // (For selector strings, that is different. If the template node is deleted once the cache is empty, the
            // original template _can't_ be recreated.)

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
                // On second access, the cache should store the selector string itself (as the node no
                // longer exists).
                $templateNode.remove();
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
            } );

            it( 'allows changes made to the underlying template node to be picked up', function () {
                var modifiedDataAttributes = {
                        "data-tag-name": "li",
                        "data-class-name": "modifiedClass",
                        "data-id": "modifiedId",
                        "data-attributes": '{ "lang": "fr", "title": "title from modified data attributes" }'
                    };

                $templateNode.attr( modifiedDataAttributes );

                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( modifiedDataAttributes, $templateNode );
            } );

            it( 'clears multiple templates from the cache when the selectors are passed as multiple arguments', function () {
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#template2", "#template3" );

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
            } );

            it( 'clears multiple templates from the cache when the selectors are passed as an array', function () {
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( [ "#template", "#template2", "#template3" ] );

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
            } );

            it( 'does not clear other templates from the cache', function () {
                var origOuterHtml2 = $templateNode2.prop( "outerHTML" ),
                    origOuterHtml3 = $templateNode3.prop( "outerHTML" );

                // Delete the template nodes so that their content indeed must come from the cache
                $templateNode2.remove();
                $templateNode3.remove();

                // Clear template #1 from the cache
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Check cache for template #2 and template #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, origOuterHtml2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, origOuterHtml3 );
            } );

            it( 'fails silently if the template has already been removed from the cache', function () {
                // Removing the template node, which is a precondition for verifying that the cache has indeed been
                // cleared.
                $templateNode.remove();

                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Second call, should go ahead without error
                Backbone.DeclarativeViews.clearCachedTemplate( "#template" );

                // Checking that the cache is still empty, and querying it now stores the selector string (because the
                // selector doesn't match anything)
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
            } );

            it( 'fails silently if the template is a string containing text which is not wrapped in HTML elements (uncacheable string), and leaves the existing cache intact', function () {
                // Set expectations for the existing templates first - they must remain intact in the cache
                var origOuterHtml = $templateNode.prop( "outerHTML" ),
                    origOuterHtml2 = $templateNode2.prop( "outerHTML" ),
                    origOuterHtml3 = $templateNode3.prop( "outerHTML" );

                Backbone.DeclarativeViews.clearCachedTemplate( "This is plain text with some <strong>markup</strong>, but not wrapped in an element" );

                // Check cache for templates #1 through #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, origOuterHtml2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, origOuterHtml3 );
            } );

            it( 'fails silently if the template is not a string, and leaves the existing cache intact', function () {
                // Set expectations for the existing templates first - they must remain intact in the cache
                var origOuterHtml = $templateNode.prop( "outerHTML" ),
                    origOuterHtml2 = $templateNode2.prop( "outerHTML" ),
                    origOuterHtml3 = $templateNode3.prop( "outerHTML" );

                Backbone.DeclarativeViews.clearCachedTemplate( function () { return "<p>Template content</p>"; } );

                // Check cache for templates #1 through #3 - still there?
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ) ).to.returnCacheValueFor( dataAttributes, origOuterHtml );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ) ).to.returnCacheValueFor( dataAttributes2, origOuterHtml2 );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ) ).to.returnCacheValueFor( dataAttributes3, origOuterHtml3 );
            } );

            it( 'throws an error when called without arguments', function () {
                expect( function () { Backbone.DeclarativeViews.clearCachedTemplate(); } ).to.throw( Backbone.DeclarativeViews.Error );
            } );

            it( 'throws an error when called with an empty string argument', function () {
                expect( function () { Backbone.DeclarativeViews.clearCachedTemplate( "" ); } ).to.throw( Backbone.DeclarativeViews.Error );
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
                // On second access, the cache should store the selector string itself for each selector
                // (as the node no longer exists).
                $templateNode.remove();
                $templateNode2.remove();
                $templateNode3.remove();

                Backbone.DeclarativeViews.clearCache();

                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template" ).html ).to.equal( "#template" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template2" ).html ).to.equal( "#template2" );
                expect( Backbone.DeclarativeViews.getCachedTemplate( "#template3" ).html ).to.equal( "#template3" );
            } );

        } );

    } );

})();