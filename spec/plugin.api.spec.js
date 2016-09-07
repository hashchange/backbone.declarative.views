/*global describe, it */
(function () {
    "use strict";

    /*****************************************************************************************************************
     *
     * These tests should run last!
     *
     * They register namespaces and data properties (with `registerCacheAlias()` and `registerDataAttribute()`), and 
     * that cannot be undone. Best to minimize interference and do it once all other tests have executed.
     *
     *****************************************************************************************************************/

    var View, view, baseTemplateHtml, $templateNode;

    describe( 'Plugin API', function () {

        beforeEach( function () {

            baseTemplateHtml = '<script id="template" type="text/x-template">This is the template <strong>markup</strong>.</script>';

            $templateNode = $( baseTemplateHtml ).appendTo( "head" );

            View = Backbone.View.extend();

        } );

        afterEach( function () {
            $templateNode.remove();
            Backbone.DeclarativeViews.clearCache();
        } );

        describe( 'Registering a cache alias.', function () {

            var globalNamespaceObjectA, globalNamespaceObjectB, viewNamespaceNameA, viewNamespaceNameB;

            before( function () {
                globalNamespaceObjectA = {};
                globalNamespaceObjectB = {};

                viewNamespaceNameA = "namespaceA";
                viewNamespaceNameB = "name space B";

                Backbone.DeclarativeViews.plugins.registerCacheAlias( globalNamespaceObjectA, viewNamespaceNameA );
                Backbone.DeclarativeViews.plugins.registerCacheAlias( globalNamespaceObjectB, viewNamespaceNameB );
            } );

            describe( 'The registered global namespace', function () {

                it( 'has a "custom" sub namespace which refers to the same object as Backbone.DeclarativeViews.custom', function () {
                    expect( globalNamespaceObjectA ).to.have.a.property( "custom", Backbone.DeclarativeViews.custom );
                    expect( globalNamespaceObjectB ).to.have.a.property( "custom", Backbone.DeclarativeViews.custom );
                    expect( globalNamespaceObjectA.custom ).to.be.an( "object" );
                } );

                it( 'exposes Backbone.DeclarativeViews.getCachedTemplate', function () {
                    expect( globalNamespaceObjectA ).to.have.a.property( "getCachedTemplate", Backbone.DeclarativeViews.getCachedTemplate );
                    expect( globalNamespaceObjectB ).to.have.a.property( "getCachedTemplate", Backbone.DeclarativeViews.getCachedTemplate );
                    expect( globalNamespaceObjectA.getCachedTemplate ).to.be.a( "function" );
                } );

                it( 'exposes Backbone.DeclarativeViews.clearCachedTemplate', function () {
                    expect( globalNamespaceObjectA ).to.have.a.property( "clearCachedTemplate", Backbone.DeclarativeViews.clearCachedTemplate );
                    expect( globalNamespaceObjectB ).to.have.a.property( "clearCachedTemplate", Backbone.DeclarativeViews.clearCachedTemplate );
                    expect( globalNamespaceObjectA.clearCachedTemplate ).to.be.a( "function" );
                } );

                it( 'exposes Backbone.DeclarativeViews.clearCache', function () {
                    expect( globalNamespaceObjectA ).to.have.a.property( "clearCache", Backbone.DeclarativeViews.clearCache );
                    expect( globalNamespaceObjectB ).to.have.a.property( "clearCache", Backbone.DeclarativeViews.clearCache );
                    expect( globalNamespaceObjectA.clearCache ).to.be.a( "function" );
                } );

            } );

            describe( 'The registered namespace on a view instance', function () {

                var view;

                beforeEach( function () {
                    view = new View();
                } );

                it( 'is an object', function () {
                    expect( view ).to.have.a.property( viewNamespaceNameA ).that.is.an( "object" );
                    expect( view ).to.have.a.property( viewNamespaceNameB ).that.is.an( "object" );
                } );

                it( 'exposes the declarativeViews.getCachedTemplate method of the view', function () {
                    expect( view[viewNamespaceNameA] ).to.have.a.property( "getCachedTemplate", view.declarativeViews.getCachedTemplate );
                    expect( view[viewNamespaceNameB] ).to.have.a.property( "getCachedTemplate", view.declarativeViews.getCachedTemplate );
                    expect( view[viewNamespaceNameA].getCachedTemplate ).to.be.a( "function" );
                } );

                it( 'exposes the declarativeViews.clearCachedTemplate method of the view', function () {
                    expect( view[viewNamespaceNameA] ).to.have.a.property( "clearCachedTemplate", view.declarativeViews.clearCachedTemplate );
                    expect( view[viewNamespaceNameB] ).to.have.a.property( "clearCachedTemplate", view.declarativeViews.clearCachedTemplate );
                    expect( view[viewNamespaceNameA].clearCachedTemplate ).to.be.a( "function" );
                } );

            } );

        } );

        describe( 'Registering, retrieving, and updating data attributes.', function () {

            var defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs,
                defaultDataAsProps, registeredCustomDataAsProps, otherCustomDataAsProps,
                modifiedDefaultDataAttrs, modifiedRegisteredCustomDataAttrs, modifiedOtherCustomDataAttrs,
                modifiedDefaultDataAsProps, modifiedRegisteredCustomDataAsProps, modifiedOtherCustomDataAsProps,
                allDataAttrs, allModifiedDataAttrs, allDataAsProps, allModifiedDataAsProps;

            before( function () {
                // NB registerDataAttribute can't process camelCased names. See the JS doc of the function.
                Backbone.DeclarativeViews.plugins.registerDataAttribute( "long-name" );
                Backbone.DeclarativeViews.plugins.registerDataAttribute( "json-content", { isJSON: true } );
            } );

            beforeEach( function () {
                defaultDataAttrs = {
                    "data-tag-name": "section",
                    "data-class-name": "dataClass",
                    "data-id": "dataId",
                    "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
                };

                // Equivalent of the data attributes as a hash of el properties.
                //
                // Written out for clarity. They could simply have been transformed with the test helper function
                // `dataAttributesToProperties( defaultDataAttrs )`.
                defaultDataAsProps = {
                    tagName: "section",
                    className: "dataClass",
                    id: "dataId",
                    attributes: { lang: "en", title: "title from data attributes" }
                };

                registeredCustomDataAttrs = {
                    "data-long-name": "foo",
                    "data-json-content": '{ "bar": "baz", "qux": "quux" }'
                };

                registeredCustomDataAsProps = {
                    longName: "foo",
                    jsonContent: { bar: "baz", qux: "quux" }
                };

                otherCustomDataAttrs = {
                    "data-unregistered": "other"
                };

                otherCustomDataAsProps = {
                    unregistered: "other"
                };

                modifiedDefaultDataAttrs = {
                    "data-tag-name": "p",
                    "data-class-name": "modifiedDataClass",
                    "data-id": "modifiedDataId",
                    "data-attributes": '{ "title": "modified title from data attributes" }'
                };

                modifiedDefaultDataAsProps = {
                    tagName: "p",
                    className: "modifiedDataClass",
                    id: "modifiedDataId",
                    attributes: { title: "modified title from data attributes" }
                };

                modifiedRegisteredCustomDataAttrs = {
                    "data-long-name": "modified foo",
                    "data-json-content": '{ "bar": "modified baz" }'
                };

                modifiedRegisteredCustomDataAsProps = {
                    longName: "modified foo",
                    jsonContent: { bar: "modified baz" }
                };

                modifiedOtherCustomDataAttrs = {
                    "data-unregistered": "modified other"
                };

                modifiedOtherCustomDataAsProps = {
                    unregistered: "modified other"
                };

                allDataAttrs = combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs );
                allModifiedDataAttrs = combine( modifiedDefaultDataAttrs, modifiedRegisteredCustomDataAttrs, modifiedOtherCustomDataAttrs );

                allDataAsProps = combine( defaultDataAsProps, registeredCustomDataAsProps, otherCustomDataAsProps );
                allModifiedDataAsProps = combine( modifiedDefaultDataAsProps, modifiedRegisteredCustomDataAsProps, modifiedOtherCustomDataAsProps );

            } );

            describe( 'Registering a data attribute', function () {

                describe( 'Invalid attribute names. Registering a data attribute throws an error', function () {

                    it( 'when the reserved word "html" is used as the name', function () {
                        var attributeName = "html";

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName )
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Cannot register attribute name "' + attributeName + '" because it is reserved' );
                    } );

                    it( 'when the reserved word "compiled" is used as the name', function () {
                        var attributeName = "compiled";

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Cannot register attribute name "' + attributeName + '" because it is reserved' );
                    } );

                    it( 'when the name matches a default data attribute of Backbone.Declarative.Views, which are all registered already', function () {
                        var attributeName = "tag-name";

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Cannot register attribute name "' + attributeName + '" because it has already been registered' );
                    } );

                    it( 'when the name matches a default data attribute of Backbone.Declarative.Views, which are all registered already', function () {
                        var attributeName = "tag-name";

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Cannot register attribute name "' + attributeName + '" because it has already been registered' );
                    } );

                    it( 'when the name matches a custom attribute which has already been registered', function () {
                        var attributeName = _.uniqueId( "test-unique" );
                        Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Cannot register attribute name "' + attributeName + '" because it has already been registered' );
                    } );

                    it( 'when the name includes the "data-" prefix', function () {
                        var attributeName = _.uniqueId( "data-test-unique" );

                        expect( function () {
                            Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                        } ).to.throw( Backbone.DeclarativeViews.CustomizationError, 'registerDataAttribute(): Illegal attribute name "' + attributeName + '", must be registered without "data-" prefix' );
                    } );

                } );

                describe( 'Detection of registered custom attributes in raw HTML/template strings', function () {

                    describe( 'When a comment in the raw HTML/template string contains', function () {

                        var attributeName, customLoaderData, expected;

                        beforeEach( function () {
                            var templateHtml;

                            // Set up the custom loader and an object for preserving its internal state.
                            customLoaderData = {};

                            Backbone.DeclarativeViews.custom.loadTemplate = function ( templateProperty ) {
                                var $template = Backbone.DeclarativeViews.defaults.loadTemplate( templateProperty );

                                customLoaderData.observedDataAtributes = $template.data();
                                return $template;
                            };

                            // Create the template
                            attributeName = _.uniqueId( "test-unique" );
                            templateHtml = '<!-- data-' + attributeName + '="foo" --><li class="bullet"></li>';

                            View = Backbone.View.extend( { template: templateHtml } );

                            expected = {};
                            expected[toCamelCase( attributeName )] = "foo";
                        } );

                        afterEach( function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = undefined;
                        } );

                        describe( 'a registered custom data attribute', function () {

                            beforeEach( function () {
                                Backbone.DeclarativeViews.plugins.registerDataAttribute( attributeName );
                                view = new View();
                            } );

                            it( 'it is detected and can be accessed by a custom loader', function () {
                                // To reap the benefits of attribute detection, a custom loader must invoke the default
                                // loader. It can then access the data attributes on the <script> wrapper tag. See
                                // _registerDataAttribute().
                                expect( customLoaderData.observedDataAtributes ).to.containSubset( expected );
                            } );

                            it( 'it does not show up in the cache', function () {
                                // This is by design. If custom attributes appeared in the cache, it might break user
                                // code which iterates over the cache properties and expects the cache to have the
                                // documented, standard properties only.

                                // We check for the presence of all variants, ie "attribute-name", "data-attribute-name",
                                // "attributeName", "dataAttributeName"
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( attributeName );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( "data-" + attributeName );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( toCamelCase( attributeName ) );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( toCamelCase( "data-" + attributeName ) );
                            } );
                            
                        } );

                        describe( 'an unregistered custom data attribute', function () {

                            beforeEach( function () {
                                view = new View();
                            } );

                            it( 'it is ignored and cannot be accessed by a custom loader', function () {
                                expect( customLoaderData.observedDataAtributes ).not.to.containSubset( expected );
                            } );

                            it( 'it does not show up in the cache', function () {
                                // We check for the presence of all variants, ie "attribute-name", "data-attribute-name",
                                // "attributeName", "dataAttributeName"
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( attributeName );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( "data-" + attributeName );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( toCamelCase( attributeName ) );
                                expect( view.declarativeViews.getCachedTemplate() ).not.to.have.key( toCamelCase( "data-" + attributeName ) );
                            } );
                            
                        } );
                        
                    } );

                } );

            } );

            describe( 'Attributes are retrieved with getDataAttributes()', function () {

                describe( 'Return values', function () {

                    it( 'the default set of `el`-related Backbone attributes is returned, if they exist', function () {
                        $templateNode.attr( allDataAttrs );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( defaultDataAsProps );
                    } );

                    it( "attributes belonging to the default set don't show up in the result if they don't exist", function () {
                        $templateNode.attr( combine( registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.not.contain.any.keys( defaultDataAsProps );
                    } );

                    it( 'custom attributes which have been registered are returned, if they exist', function () {
                        $templateNode.attr( allDataAttrs );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( registeredCustomDataAsProps );
                    } );

                    it( "registered custom attributes don't show up in the result if they don't exist", function () {
                        $templateNode.attr( combine( defaultDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.not.contain.any.keys( registeredCustomDataAsProps );
                    } );

                    it( 'non-registered, arbitrary data attributes are also returned, if they exist', function () {
                        $templateNode.attr( allDataAttrs );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( otherCustomDataAsProps );
                    } );

                    it( 'dashed duplicates of any of the attributes do not accidentally appear in the return value', function () {
                        $templateNode.attr( allDataAttrs );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.not.contain.any.keys( dashedKeyAlternatives( allDataAsProps ) );
                    } );

                } );

                describe( 'jQuery data object', function () {

                    var jQueryData;

                    beforeEach( function () {
                        $templateNode.attr( allDataAttrs );
                        Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        jQueryData = $templateNode.data();
                    } );

                    it( 'default attributes are available in the jQuery data object', function () {
                        expect( jQueryData ).to.containSubset( defaultDataAsProps );
                    } );

                    it( 'registered custom attributes are available in the jQuery data object', function () {
                        expect( jQueryData ).to.containSubset( registeredCustomDataAsProps );
                    } );

                    it( 'non-registered, arbitrary data attributes are also available in the jQuery data object', function () {
                        expect( jQueryData ).to.containSubset( otherCustomDataAsProps );
                    } );

                    it( 'dashed duplicates of any of the attributes have not been created accidentally', function () {
                        expect( jQueryData ).to.not.contain.any.keys( dashedKeyAlternatives( allDataAsProps ) );
                    } );

                } );

                describe( 'Subsequent access', function () {

                    var jQueryData, retrieved;

                    beforeEach( function () {
                        $templateNode.attr( allDataAttrs );

                        // First access (return values not recorded)
                        Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        $templateNode.data();
                    } );

                    describe( 'After second retrieval, when the attributes have been altered in the DOM,', function () {

                        beforeEach( function () {
                            $templateNode.attr( allModifiedDataAttrs );

                            // Second access
                            retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                            jQueryData = $templateNode.data();
                        } );

                        describe( 'the return value of getDataAttributes()', function () {

                            it( 'reflects the changes of the default attributes', function () {
                                expect( retrieved ).to.containSubset( modifiedDefaultDataAsProps );
                            } );

                            it( 'reflects the changes of registered custom attributes', function () {
                                expect( retrieved ).to.containSubset( modifiedRegisteredCustomDataAsProps );
                            } );

                            it( 'does not reflect the changes of non-registered, arbitrary data attributes', function () {
                                // Backbone.Declarative.Views must not interfere with data it does not own.
                                // Unregistered data attributes are cached by jQuery on first access, and not
                                // updated from the DOM afterwards. That is the default behaviour of jQuery.
                                expect( retrieved ).to.containSubset( otherCustomDataAsProps );
                            } );

                            it( 'does not contain dashed duplicates of any of the attributes', function () {
                                expect( retrieved ).to.not.contain.any.keys( dashedKeyAlternatives( allModifiedDataAsProps ) );
                            } );

                        } );

                        describe( 'the jQuery data object', function () {

                            it( 'is in sync with changes of the default attributes', function () {
                                expect( jQueryData ).to.containSubset( modifiedDefaultDataAsProps );
                            } );

                            it( 'is in sync with changes of registered custom attributes', function () {
                                expect( jQueryData ).to.containSubset( modifiedRegisteredCustomDataAsProps );
                            } );

                            it( 'is not updated for changes of non-registered, arbitrary data attributes', function () {
                                // Backbone.Declarative.Views must not interfere with data it does not own.
                                expect( jQueryData ).to.containSubset( otherCustomDataAsProps );
                            } );

                            it( 'does not contain dashed duplicates of any of the attributes', function () {
                                expect( jQueryData ).to.not.contain.any.keys( dashedKeyAlternatives( allModifiedDataAsProps ) );
                            } );

                        } );

                    } );

                    describe( 'After second retrieval, when the attributes have been removed from the DOM,', function () {

                        beforeEach( function () {
                            var keys = _.keys( allDataAttrs );

                            _.each( keys, function ( key ) {
                                $templateNode.removeAttr( key );
                            } );

                            // Second access
                            retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                            jQueryData = $templateNode.data();
                        } );

                        describe( 'the return value of getDataAttributes()', function () {

                            it( 'does not contain default attributes, which have been removed', function () {
                                expect( retrieved ).to.not.contain.any.keys( defaultDataAsProps );
                            } );

                            it( 'does not contain registered custom attributes, which have been removed', function () {
                                expect( retrieved ).to.not.contain.any.keys( registeredCustomDataAsProps );
                            } );

                            it( 'does not contain non-registered, arbitrary data attributes', function () {
                                // Backbone.Declarative.Views must not interfere with data it does not own. That data
                                // comes from the jQuery cache, without being updated from the DOM, which is the default
                                // behaviour of jQuery data.
                                expect( retrieved ).to.containSubset( otherCustomDataAsProps );
                            } );

                            it( 'does not contain dashed duplicates of any of the attributes', function () {
                                expect( retrieved ).to.not.contain.any.keys( dashedKeyAlternatives( allDataAsProps ) );
                            } );

                        } );

                        describe( 'the jQuery data object', function () {

                            it( 'does no longer contain default attributes, which have been removed', function () {
                                expect( jQueryData ).to.not.contain.any.keys( defaultDataAsProps );
                            } );

                            it( 'does no longer contain registered custom attributes, which have been removed', function () {
                                expect( jQueryData ).to.not.contain.any.keys( registeredCustomDataAsProps );
                            } );

                            it( 'still contains non-registered, arbitrary data attributes, even though they have been removed from the DOM', function () {
                                // Backbone.Declarative.Views must not interfere with data it does not own.
                                expect( jQueryData ).to.containSubset( otherCustomDataAsProps );
                            } );

                            it( 'does not contain dashed duplicates of any of the attributes', function () {
                                expect( jQueryData ).to.not.contain.any.keys( dashedKeyAlternatives( allDataAsProps ) );
                            } );

                        } );

                    } );

                } );

            } );

            describe( 'The jQuery data cache is updated from the DOM with updateJqueryDataCache()', function () {

                // NB updateJqueryDataCache() is an internal tool which only acts on an existing jQuery data cache, but
                // does not create one from scratch. See the JS doc of _updateJQueryDataCache().

                var jQueryData;

                beforeEach( function () {
                    $templateNode.attr( allDataAttrs );

                    // First access (return values not recorded)
                    Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                    $templateNode.data();
                } );

                describe( 'When the attributes have been altered in the DOM, the jQuery data object', function () {

                    beforeEach( function () {
                        $templateNode.attr( allModifiedDataAttrs );

                        // Second access
                        Backbone.DeclarativeViews.plugins.updateJqueryDataCache( $templateNode );
                        jQueryData = $templateNode.data();
                    } );

                    it( 'is in sync with changes of the default attributes', function () {
                        expect( jQueryData ).to.containSubset( modifiedDefaultDataAsProps );
                    } );

                    it( 'is in sync with changes of registered custom attributes', function () {
                        expect( jQueryData ).to.containSubset( modifiedRegisteredCustomDataAsProps );
                    } );

                    it( 'is not updated for changes of non-registered, arbitrary data attributes', function () {
                        // Backbone.Declarative.Views must not interfere with data it does not own.
                        expect( jQueryData ).to.containSubset( otherCustomDataAsProps );
                    } );

                    it( 'does not contain dashed duplicates of any of the attributes', function () {
                        expect( jQueryData ).to.not.contain.any.keys( dashedKeyAlternatives( allModifiedDataAsProps ) );
                    } );

                } );

                describe( 'When the attributes have been removed from the DOM, the jQuery data object', function () {

                    beforeEach( function () {
                        var keys = _.keys( allDataAttrs );

                        _.each( keys, function ( key ) {
                            $templateNode.removeAttr( key );
                        } );

                        // Second access
                        Backbone.DeclarativeViews.plugins.updateJqueryDataCache( $templateNode );
                        jQueryData = $templateNode.data();
                    } );

                    it( 'does no longer contain default attributes, which have been removed', function () {
                        expect( jQueryData ).to.not.contain.any.keys( defaultDataAsProps );
                    } );

                    it( 'does no longer contain registered custom attributes, which have been removed', function () {
                        expect( jQueryData ).to.not.contain.any.keys( registeredCustomDataAsProps );
                    } );

                    it( 'still contains non-registered, arbitrary data attributes, even though they have been removed from the DOM', function () {
                        // Backbone.Declarative.Views must not interfere with data it does not own.
                        expect( jQueryData ).to.containSubset( otherCustomDataAsProps );
                    } );

                    it( 'does not contain dashed duplicates of any of the attributes', function () {
                        expect( jQueryData ).to.not.contain.any.keys( dashedKeyAlternatives( allDataAsProps ) );
                    } );

                } );

            } );

        } );

        describe( 'Events', function () {

            var dataAttributes, attributesAsProperties, createHandler, processHandler, fetchHandler;

            beforeEach( function () {
                dataAttributes = {
                    "data-tag-name": "section",
                    "data-class-name": "dataClass",
                    "data-id": "dataId",
                    "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
                };

                // Equivalent of the data attributes as a hash of el properties.
                //
                // Written out for clarity. They could simply have been transformed with the test helper function
                // `dataAttributesToProperties( defaultDataAttrs )`.
                attributesAsProperties = {
                    tagName: "section",
                    className: "dataClass",
                    id: "dataId",
                    attributes: { lang: "en", title: "title from data attributes" }
                };

                $templateNode.attr( dataAttributes );

                createHandler = sinon.spy();
                processHandler = sinon.spy();
                fetchHandler = sinon.spy();

                Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:create", createHandler );
                Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:view:process", processHandler );
                Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:view:fetch", fetchHandler );
            } );

            afterEach( function () {
                Backbone.DeclarativeViews.plugins.events.off();
            } );

            describe( 'cacheEntry:view:process event', function () {

                describe( 'Triggering the event', function () {

                    describe( 'When a view is created', function () {

                        describe( 'with a template which is not in the cache, the event fires', function () {

                            beforeEach( function () {
                                view = new View( { template: "#template" } );
                            } );

                            it( 'exactly once', function () {
                                expect( processHandler ).to.have.been.calledOnce;
                            } );

                            it( 'before the cacheEntry:view:fetch event', function () {
                                expect( processHandler ).to.have.been.calledBefore( fetchHandler );
                            } );

                            it( 'with the cache entry passed as first argument', function () {
                                var firstArg = processHandler.getCall( 0 ).args[0];
                                expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                            } );

                            it( 'with the template property passed as second argument', function () {
                                var secondArg = processHandler.getCall( 0 ).args[1];
                                expect( secondArg ).to.equal( "#template" );
                            } );

                            it( 'with the view passed as third argument', function () {
                                var thirdArg = processHandler.getCall( 0 ).args[2];
                                expect( thirdArg ).to.equal( view );
                            } );

                        } );

                        describe( 'with a template which is already in the cache, the event fires', function () {

                            beforeEach( function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                view = new View( { template: "#template" } );
                            } );

                            it( 'exactly once', function () {
                                expect( processHandler ).to.have.been.calledOnce;
                            } );

                            it( 'before the cacheEntry:view:fetch event', function () {
                                expect( processHandler ).to.have.been.calledBefore( fetchHandler );
                            } );

                            it( 'with the cache entry passed as first argument', function () {
                                var firstArg = processHandler.getCall( 0 ).args[0];
                                expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                            } );

                            it( 'with the template property passed as second argument', function () {
                                var secondArg = processHandler.getCall( 0 ).args[1];
                                expect( secondArg ).to.equal( "#template" );
                            } );

                            it( 'with the view passed as third argument', function () {
                                var thirdArg = processHandler.getCall( 0 ).args[2];
                                expect( thirdArg ).to.equal( view );
                            } );

                        } );

                    } );

                    describe( 'The event does not fire', function () {

                        var _originalCustomLoader;

                        beforeEach( function () {
                            _originalCustomLoader = Backbone.DeclarativeViews.custom.loadTemplate;
                        } );

                        afterEach( function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = _originalCustomLoader;
                        } );

                        it( 'when the template is retrieved from the view cache after view creation', function () {
                            view = new View( { template: "#template" } );
                            processHandler.reset();
                            view.declarativeViews.getCachedTemplate();

                            expect( processHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view template is an empty string (cache miss)', function () {
                            view = new View( { template: "" } );
                            expect( processHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view template is a function (cache miss)', function () {
                            view = new View( {
                                template: function () { return "foo"; }
                            } );
                            expect( processHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view template is a string that a (custom) loader cannot process, throwing a generic error (cache miss)', function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                            view = new View( { template: "#throwsError" } );
                            expect( processHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view does not specify a template', function () {
                            view = new View();
                            expect( processHandler ).to.not.have.been.called;
                        } );

                        describe( 'when the template is retrieved with the global API', function () {

                            it( 'without a view argument', function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                expect( processHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has been created with that template', function () {
                                view = new View( { template: "#template" } );
                                processHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( processHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has been created with another template', function () {
                                var $template2 = $templateNode.clone().attr( { id: "template2" } ).appendTo( "head" );
                                view = new View( { template: "#template2" } );
                                processHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( processHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has not been created with any template', function () {
                                view = new View();
                                processHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( processHandler ).to.not.have.been.called;
                            } );
                            
                        } );
                        
                    } );

                } );

                describe( 'Modifications of the cache value in the event handler', function () {

                    var modifyingProcessHandler, originalProperties, modifiedProperties;

                    beforeEach( function () {
                        originalProperties = _.clone( attributesAsProperties );
                        modifiedProperties = {
                            tagName: "aside",
                            className: "modifiedClass",
                            attributes: {
                                lang: "fr"
                            },
                            _pluginData: {
                                added: "foo"
                            }
                        };

                        modifyingProcessHandler = function ( cacheValue ) {
                            cacheValue.tagName = modifiedProperties.tagName;
                            cacheValue.className = modifiedProperties.className;
                            cacheValue.attributes.lang = modifiedProperties.attributes.lang;
                            cacheValue._pluginData.added = modifiedProperties._pluginData.added;

                        };

                        Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:view:process", modifyingProcessHandler );

                        view = new View( { template: "#template" } );
                    } );

                    describe( 'made to `el`-related properties (all properties except the _pluginData property)', function () {

                        it( 'do not show up in the result returned by the cache query and do not get applied to the `el`', function () {
                            expect( view.el.tagName.toLowerCase() ).to.equal( originalProperties.tagName );
                            expect( view.el.className ).to.equal( originalProperties.className );
                            expect( view.el.lang ).to.equal( originalProperties.attributes.lang );
                        } );

                        it( 'do not show up in the cache value passed to a handler for the cacheEntry:view:fetch event', function () {
                            var fetchEventCacheArg = fetchHandler.getCall( 0 ).args[0];
                            expect( fetchEventCacheArg.tagName ).to.equal( originalProperties.tagName );
                            expect( fetchEventCacheArg.className ).to.equal( originalProperties.className );
                            expect( fetchEventCacheArg.attributes.lang ).to.equal( originalProperties.attributes.lang );
                        } );

                        it( 'do not change the cache entry itself', function () {
                            var cacheEntry = Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                            expect( cacheEntry.tagName ).to.equal( originalProperties.tagName );
                            expect( cacheEntry.className ).to.equal( originalProperties.className );
                            expect( cacheEntry.attributes.lang ).to.equal( originalProperties.attributes.lang );
                        } );

                    } );

                    describe( 'made to the _pluginData hash', function () {

                        it( 'show up in the cache value passed to a handler for the cacheEntry:view:fetch event', function () {
                            var fetchEventCacheArg = fetchHandler.getCall( 0 ).args[0];
                            expect( fetchEventCacheArg._pluginData ).to.have.a.property( "added", modifiedProperties._pluginData.added );
                        } );

                        it( 'change the cache entry itself and persist', function () {
                            var cacheEntry = Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                            expect( cacheEntry._pluginData ).to.have.a.property( "added", modifiedProperties._pluginData.added );
                        } );

                    } );

                } );

            } );

            describe( 'cacheEntry:view:fetch event', function () {

                describe( 'Triggering the event', function () {

                    describe( 'When a view is created', function () {

                        describe( 'with a template which is not in the cache, the event fires', function () {

                            beforeEach( function () {
                                view = new View( { template: "#template" } );
                            } );

                            it( 'once for each el-related property which has not been defined on the view itself', function () {
                                // In the test fixture, no el-related properties are defined on the view itself.
                                // Therefore, we expect four calls (for tagName, className, id, attributes).
                                expect( fetchHandler ).to.have.callCount( 4 );
                            } );

                            it( 'with the cache entry passed as first argument', function () {
                                var firstArg = fetchHandler.getCall( 0 ).args[0];
                                expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                            } );

                            it( 'with the template property passed as second argument', function () {
                                var secondArg = fetchHandler.getCall( 0 ).args[1];
                                expect( secondArg ).to.equal( "#template" );
                            } );

                            it( 'with the view passed as third argument', function () {
                                var thirdArg = fetchHandler.getCall( 0 ).args[2];
                                expect( thirdArg ).to.equal( view );
                            } );

                        } );

                        describe( 'with a template which is already in the cache, the event fires', function () {

                            beforeEach( function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                view = new View( { template: "#template" } );
                            } );

                            it( 'once for each el-related property which has not been defined on the view itself', function () {
                                // In the test fixture, no el-related properties are defined on the view itself.
                                // Therefore, we expect four calls (for tagName, className, id, attributes).
                                expect( fetchHandler ).to.have.callCount( 4 );
                            } );

                            it( 'with the cache entry passed as first argument', function () {
                                var firstArg = fetchHandler.getCall( 0 ).args[0];
                                expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                            } );

                            it( 'with the template property passed as second argument', function () {
                                var secondArg = fetchHandler.getCall( 0 ).args[1];
                                expect( secondArg ).to.equal( "#template" );
                            } );

                            it( 'with the view passed as third argument', function () {
                                var thirdArg = fetchHandler.getCall( 0 ).args[2];
                                expect( thirdArg ).to.equal( view );
                            } );

                        } );

                    } );

                    describe( 'When the template is retrieved from the view cache after view creation, the event fires', function () {

                        beforeEach( function () {
                            view = new View( { template: "#template" } );
                            fetchHandler.reset();
                            view.declarativeViews.getCachedTemplate();
                        } );

                        it( 'exactly once', function () {
                            expect( fetchHandler ).to.have.been.calledOnce;
                        } );

                        it( 'with the cache entry passed as first argument', function () {
                            var firstArg = fetchHandler.getCall( 0 ).args[0];
                            expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                        } );

                        it( 'with the template property passed as second argument', function () {
                            var secondArg = fetchHandler.getCall( 0 ).args[1];
                            expect( secondArg ).to.equal( "#template" );
                        } );

                        it( 'with the view passed as third argument', function () {
                            var thirdArg = fetchHandler.getCall( 0 ).args[2];
                            expect( thirdArg ).to.equal( view );
                        } );

                    } );

                    describe( 'The event does not fire', function () {

                        var _originalCustomLoader;

                        beforeEach( function () {
                            _originalCustomLoader = Backbone.DeclarativeViews.custom.loadTemplate;
                        } );

                        afterEach( function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = _originalCustomLoader;
                        } );

                        it( 'when the view template is an empty string (cache miss)', function () {
                            view = new View( { template: "" } );
                            expect( fetchHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view template is a function (cache miss)', function () {
                            view = new View( {
                                template: function () { return "foo"; }
                            } );
                            expect( fetchHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view template is a string that a (custom) loader cannot process, throwing a generic error (cache miss)', function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                            view = new View( { template: "#throwsError" } );
                            expect( fetchHandler ).to.not.have.been.called;
                        } );

                        it( 'when the view does not specify a template', function () {
                            view = new View();
                            expect( fetchHandler ).to.not.have.been.called;
                        } );

                        describe( 'when the template is retrieved with the global API', function () {

                            it( 'without a view argument', function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                expect( fetchHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has been created with that template', function () {
                                view = new View( { template: "#template" } );
                                fetchHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( fetchHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has been created with another template', function () {
                                var $template2 = $templateNode.clone().attr( { id: "template2" } ).appendTo( "head" );
                                view = new View( { template: "#template2" } );
                                fetchHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( fetchHandler ).to.not.have.been.called;
                            } );

                            it( 'with a view as argument which has not been created with any template', function () {
                                view = new View();
                                fetchHandler.reset();

                                Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                expect( fetchHandler ).to.not.have.been.called;
                            } );

                        } );

                    } );

                } );

                describe( 'Modifications of the cache value in the event handler', function () {

                    var modifyingFetchHandler, originalProperties, modifiedProperties;

                    beforeEach( function () {
                        originalProperties = _.clone( attributesAsProperties );
                        modifiedProperties = {
                            tagName: "aside",
                            className: "modifiedClass",
                            attributes: {
                                lang: "fr"
                            },
                            _pluginData: {
                                added: "foo"
                            }
                        };

                        modifyingFetchHandler = function ( cacheValue ) {
                            cacheValue.tagName = modifiedProperties.tagName;
                            cacheValue.className = modifiedProperties.className;
                            cacheValue.attributes.lang = modifiedProperties.attributes.lang;
                            cacheValue._pluginData.added = modifiedProperties._pluginData.added;

                        };

                        Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:view:fetch", modifyingFetchHandler );

                        view = new View( { template: "#template" } );
                    } );

                    it( 'show up in the result returned by the cache query and get applied to the `el`', function () {
                        expect( view.el.tagName.toLowerCase() ).to.equal( modifiedProperties.tagName );
                        expect( view.el.className ).to.equal( modifiedProperties.className );
                        expect( view.el.lang ).to.equal( modifiedProperties.attributes.lang );
                    } );

                    it( 'do not change the cache entry itself, except for modifications of _pluginData, which persist in the cache', function () {
                        var cacheEntry = Backbone.DeclarativeViews.getCachedTemplate( "#template" );

                        expect( cacheEntry.tagName ).to.equal( originalProperties.tagName );
                        expect( cacheEntry.className ).to.equal( originalProperties.className );
                        expect( cacheEntry.attributes.lang ).to.equal( originalProperties.attributes.lang );

                        expect( cacheEntry._pluginData ).to.have.a.property( "added", modifiedProperties._pluginData.added );
                    } );

                } );

            } );

            describe( 'cacheEntry:create event', function () {

                describe( 'Triggering the event', function () {

                    describe( 'The template is not in the cache.', function () {

                        describe( 'When a view is created, the event fires', function () {

                            beforeEach( function () {
                                view = new View( { template: "#template" } );
                            } );

                            it( 'exactly once when at no el-related properties have been defined on the view itself', function () {
                                // In the test fixture, no el-related properties are defined on the view itself.
                                expect( createHandler ).to.have.been.calledOnce;
                            } );

                            it( 'exactly once when all but one of the el-related properties have been defined on the view itself', function () {
                                // In the test fixture, no el-related properties are defined on the view itself, and the
                                // view is already created. We need to start over.
                                Backbone.DeclarativeViews.clearCache();
                                createHandler.reset();

                                // NB Here, we don't define the `id` property on the view.
                                view = new View( { template: "#template", tagName: "p", className: "definedOnView", attributes: { lang: "ru" } } );
                                expect( createHandler ).to.have.been.calledOnce;
                            } );

                            it( 'with the cache entry passed as first argument', function () {
                                var firstArg = createHandler.getCall( 0 ).args[0];
                                expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                            } );

                            it( 'with the template property passed as second argument', function () {
                                var secondArg = createHandler.getCall( 0 ).args[1];
                                expect( secondArg ).to.equal( "#template" );
                            } );

                            it( 'with the view passed as third argument', function () {
                                var thirdArg = createHandler.getCall( 0 ).args[2];
                                expect( thirdArg ).to.equal( view );
                            } );

                        } );

                        describe( 'When the template is retrieved with the global API, the event fires', function () {

                            describe( 'without an additional view argument, the event fires', function () {

                                beforeEach( function () {
                                    Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                } );

                                it( 'exactly once', function () {
                                    expect( createHandler ).to.have.been.calledOnce;
                                } );

                                it( 'with the cache entry passed as first argument', function () {
                                    var firstArg = createHandler.getCall( 0 ).args[0];
                                    expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                                } );

                                it( 'with the template property passed as second argument', function () {
                                    var secondArg = createHandler.getCall( 0 ).args[1];
                                    expect( secondArg ).to.equal( "#template" );
                                } );

                                it( 'with the third argument being undefined', function () {
                                    var thirdArg = createHandler.getCall( 0 ).args[2];
                                    expect( thirdArg ).to.be.undefined;
                                } );


                            } );

                            describe( 'with an additional view argument', function () {

                                beforeEach( function () {
                                    view = new View();
                                    Backbone.DeclarativeViews.getCachedTemplate( "#template", view );
                                } );

                                it( 'exactly once', function () {
                                    expect( createHandler ).to.have.been.calledOnce;
                                } );

                                it( 'with the cache entry passed as first argument', function () {
                                    var firstArg = createHandler.getCall( 0 ).args[0];
                                    expect( firstArg ).to.returnCacheValueFor( dataAttributes, $templateNode );
                                } );

                                it( 'with the template property passed as second argument', function () {
                                    var secondArg = createHandler.getCall( 0 ).args[1];
                                    expect( secondArg ).to.equal( "#template" );
                                } );

                                it( 'with the view passed as third argument', function () {
                                    var thirdArg = createHandler.getCall( 0 ).args[2];
                                    expect( thirdArg ).to.equal( view );
                                } );

                            } );

                        } );

                    } );

                    describe( 'The event does not fire', function () {

                        var _originalCustomLoader;

                        beforeEach( function () {
                            _originalCustomLoader = Backbone.DeclarativeViews.custom.loadTemplate;
                        } );

                        afterEach( function () {
                            Backbone.DeclarativeViews.custom.loadTemplate = _originalCustomLoader;
                        } );

                        describe( 'when the template is not in the cache and', function () {

                            it( 'the view template is an empty string (cache miss)', function () {
                                view = new View( { template: "" } );
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'the view template is a function (cache miss)', function () {
                                view = new View( {
                                    template: function () { return "foo"; }
                                } );
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'the view template is a string that a (custom) loader cannot process, throwing a generic error (cache miss)', function () {
                                Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                                view = new View( { template: "#throwsError" } );
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'the view does not specify a template', function () {
                                view = new View();
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'all el-related properties are defined on the view itself', function () {
                                // ... unless plugins.enforceTemplateLoading() has been called (which we can't test
                                // because it changes the state irreversibly). That call would ensure that the cache
                                // entry is created.
                                view = new View( { template: "#template", tagName: "p", className: "definedOnView", id: "setDynamically", attributes: { lang: "ru" } } );
                                expect( createHandler ).to.not.have.been.called;
                            } );

                        } );

                        describe( 'when the template is already in the cache and', function () {

                            beforeEach( function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                createHandler.reset();
                            } );

                            it( 'a view is created with the template', function () {
                                view = new View( { template: "#template" } );
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'the template is retrieved from the view cache after view creation', function () {
                                view = new View( { template: "#template" } );
                                createHandler.reset();
                                view.declarativeViews.getCachedTemplate();
                                expect( createHandler ).to.not.have.been.called;
                            } );

                            it( 'the template is retrieved with the global API', function () {
                                Backbone.DeclarativeViews.getCachedTemplate( "#template" );
                                expect( createHandler ).to.not.have.been.called;

                            } );

                        } );

                    } );

                } );

                describe( 'Modifications of the cache value in the event handler', function () {

                    var modifyingCreateHandler, originalProperties, modifiedProperties;

                    beforeEach( function () {
                        originalProperties = _.clone( attributesAsProperties );
                        modifiedProperties = {
                            tagName: "aside",
                            className: "modifiedClass",
                            attributes: {
                                lang: "fr"
                            }
                        };

                        modifyingCreateHandler = function ( cacheValue ) {
                            cacheValue.tagName = modifiedProperties.tagName;
                            cacheValue.className = modifiedProperties.className;
                            cacheValue.attributes.lang = modifiedProperties.attributes.lang;
                        };

                        Backbone.DeclarativeViews.plugins.events.on( "cacheEntry:create", modifyingCreateHandler );

                        view = new View( { template: "#template" } );
                    } );

                    it( 'show up in the cache value passed to a handler for the cacheEntry:view:process event', function () {
                        var processEventCacheArg = processHandler.getCall( 0 ).args[0];

                        expect( processEventCacheArg.tagName.toLowerCase() ).to.equal( modifiedProperties.tagName );
                        expect( processEventCacheArg.className ).to.equal( modifiedProperties.className );
                        expect( processEventCacheArg.attributes.lang ).to.equal( modifiedProperties.attributes.lang );
                    } );

                    it( 'show up in the cache value passed to a handler for the cacheEntry:view:fetch event', function () {
                        var fetchEventCacheArg = fetchHandler.getCall( 0 ).args[0];

                        expect( fetchEventCacheArg.tagName.toLowerCase() ).to.equal( modifiedProperties.tagName );
                        expect( fetchEventCacheArg.className ).to.equal( modifiedProperties.className );
                        expect( fetchEventCacheArg.attributes.lang ).to.equal( modifiedProperties.attributes.lang );
                    } );

                    it( 'show up in the result returned by the cache query and get applied to the `el`', function () {
                        expect( view.el.tagName.toLowerCase() ).to.equal( modifiedProperties.tagName );
                        expect( view.el.className ).to.equal( modifiedProperties.className );
                        expect( view.el.lang ).to.equal( modifiedProperties.attributes.lang );
                    } );

                    it( 'alter the cache entry itself and persist', function () {
                        var cacheEntry = Backbone.DeclarativeViews.getCachedTemplate( "#template" );

                        expect( cacheEntry.tagName ).to.equal( modifiedProperties.tagName );
                        expect( cacheEntry.className ).to.equal( modifiedProperties.className );
                        expect( cacheEntry.attributes.lang ).to.equal( modifiedProperties.attributes.lang );
                    } );

                } );

            } );

        } );

        describe( 'View ID', function () {

            describe( 'The view id is available', function () {

                describe( 'when a view is created', function () {

                    var _originalCustomLoader;

                    beforeEach( function () {
                        _originalCustomLoader = Backbone.DeclarativeViews.custom.loadTemplate;
                    } );

                    afterEach( function () {
                        Backbone.DeclarativeViews.custom.loadTemplate = _originalCustomLoader;
                    } );

                    it( 'with a template in the DOM', function () {
                        view = new View( { template: "#template" } );
                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                    it( 'with a template string', function () {
                        view = new View( { template: "hi there!" } );
                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                    it( 'with a template set to an empty string (cache miss)', function () {
                        view = new View( { template: "" } );
                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                    it( 'with a template set to a function (cache miss)', function () {
                        view = new View( {
                            template: function () { return "foo"; }
                        } );
                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                    it( 'with a template string that a (custom) loader cannot process, throwing a generic error (cache miss)', function () {
                        Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                        view = new View( { template: "#throwsError" } );

                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                    it( 'without a template', function () {
                        view = new View();
                        expect( view.declarativeViews.meta ).to.have.a.property( "viewId" );
                        expect( view.declarativeViews.meta.viewId ).to.match( /^view-\d+/ );
                    } );

                } );

                it( 'by the time a loader runs', function () {
                    // The loader is the first external entity to access view data, even before the events
                    // cacheEntry:view:process and :fetch are triggered, and a long time ahead of initialize().
                    // There is no need to test all of them if the view ID is already available to the loader.
                    var viewId;

                    Backbone.DeclarativeViews.custom.loadTemplate = function ( templateProperty, view ) {
                        viewId = view.declarativeViews.meta.viewId;
                        return $( templateProperty );
                    };

                    view = new View( { template: "#template" } );
                    expect( viewId ).to.match( /^view-\d+/ );
                } );
                
            } );

        } );

        describe( 'Helper function tryCompileTemplate', function () {

            afterEach( function () {
                Backbone.DeclarativeViews.custom.compiler = undefined;
            } );

            describe( 'Compiler configuration', function () {
                
                it( 'When no custom compiler is defined, calling tryCompileTemplate returns undefined', function () {
                    Backbone.DeclarativeViews.custom.compiler = undefined;
                    expect( Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) ) ).to.be.undefined;
                } );

                it( 'When the custom compiler is not a function, calling tryCompileTemplate throws an error', function () {
                    Backbone.DeclarativeViews.custom.compiler = {};
                    expect( function () {
                        Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) );
                    } ).to.throw( Backbone.DeclarativeViews.CustomizationError, "Invalid custom template compiler set in Backbone.DeclarativeViews.custom.compiler: compiler is not a function" );
                } );

            } );

            describe( 'Arguments', function () {

                var compiler;

                beforeEach( function () {
                    compiler = sinon.spy();
                    Backbone.DeclarativeViews.custom.compiler = compiler;
                } );

                describe( 'When tryCompileTemplate is called with one argument,', function () {

                    beforeEach( function () {
                        Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo" );
                    } );

                    it( 'the compiler receives two arguments', function () {
                        expect( compiler.getCall( 0 ).args ).to.have.length( 2 );
                    } );

                    it( 'the first argument is the one passed to the compiler', function () {
                        expect( compiler ).to.have.been.calledWith( "foo" );
                    } );

                    it( 'the second argument passed to the compiler is undefined', function () {
                        expect( compiler.getCall( 0 ).args[1] ).to.be.undefined;
                    } );

                } );

                describe( 'When tryCompileTemplate is called with two arguments,', function () {

                    it( 'both arguments are passed to the compiler, in that order', function () {
                        var arg1 = "foo",
                            arg2 = $( "#bar" );

                        Backbone.DeclarativeViews.plugins.tryCompileTemplate( arg1, arg2 );
                        expect( compiler ).to.have.been.calledWithExactly( arg1, arg2 );
                    } );
                    
                } );

            } );

            describe( 'Compiler error', function () {

                describe( 'When the compiler throws an error, Backbone.Declarative.Views throws an error', function () {
                    var compilerErrorMessage;

                    beforeEach( function () {
                        compilerErrorMessage = "compiler error message";
                        Backbone.DeclarativeViews.custom.compiler = function () { throw new Error( compilerErrorMessage ); };
                    } );

                    it( 'of type Backbone.DeclarativeViews.CompilerError, with a friendly error message of its own', function () {
                        expect( function () {
                            Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) );
                        } ).to.throw( Backbone.DeclarativeViews.CompilerError, "An error occurred while compiling the template" );
                    } );

                    it( 'forwarding the original error message of the compiler', function () {
                        expect( function () {
                            Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) );
                        } ).to.throw( compilerErrorMessage );
                    } );

                } );
                
            } );

            describe( 'Return value', function () {

                describe( 'tryCompileTemplate returns the compiler return value, as it is,', function () {

                    it( 'when it is a function', function () {
                        // This is what a compiler actually should return
                        var compilerReturnValue = function () {};
                        Backbone.DeclarativeViews.custom.compiler = function () { return compilerReturnValue; };
                        expect( Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) ) ).to.equal( compilerReturnValue );
                    } );

                    it( 'when it is a string', function () {
                        Backbone.DeclarativeViews.custom.compiler = function () { return "baz"; };
                        expect( Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) ) ).to.equal( "baz" );
                    } );

                    it( 'when it is undefined', function () {
                        Backbone.DeclarativeViews.custom.compiler = function () {};
                        expect( Backbone.DeclarativeViews.plugins.tryCompileTemplate( "foo", $( "#bar" ) ) ).to.be.undefined;
                    } );

                } );
                
            } );
            
        } );

        // Spec: Enforcing template loading with enforceTemplateLoading()
        //
        // Currently, this test is not implemented. Calling enforceTemplateLoading() is irreversible, it can't be
        // turned off again. It would affect all subsequent tests - too strong an effect to be worth it.
        //
        // If the tests were implemented, this is what they would cover:
        //
        // - Define **all** el props in a Backbone view - this would prevent the loader from being called, normally,
        //   if enforceTemplateLoading() were not invoked. But it is, so set up a spy checking if the loader has
        //   indeed been called. For a spy, simply create a custom loader.
        // - Check that nothing breaks when the template property is set to a function, an empty string etc.

    } );

})();