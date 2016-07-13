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

            $templateNode = $( baseTemplateHtml ).appendTo( "body" );

            View = Backbone.View.extend();

        } );

        afterEach( function () {
            $templateNode.remove();
            Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
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
                modifiedDefaultDataAsProps, modifiedRegisteredCustomDataAsProps, modifiedOtherCustomDataAsProps;

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

            } );

            describe( 'Attributes are retrieved with getDataAttributes()', function () {

                describe( 'Return values', function () {

                    it( 'the default set of `el`-related Backbone attributes is returned, if they exist', function () {
                        $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( defaultDataAsProps );
                    } );

                    it( "attributes belonging to the default set don't show up in the result if they don't exist", function () {
                        $templateNode.attr( combine( registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.not.contain.any.keys( defaultDataAsProps );
                    } );

                    it( 'custom attributes which have been registered are returned, if they exist', function () {
                        $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( registeredCustomDataAsProps );
                    } );

                    it( "registered custom attributes don't show up in the result if they don't exist", function () {
                        $templateNode.attr( combine( defaultDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.not.contain.any.keys( registeredCustomDataAsProps );
                    } );

                    it( 'non-registered, arbitrary data attributes are also returned, if they exist', function () {
                        $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        var retrieved = Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        expect( retrieved ).to.containSubset( otherCustomDataAsProps );
                    } );

                } );

                describe( 'jQuery data object', function () {

                    var jQueryData;

                    beforeEach( function () {
                        $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );
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

                } );

                describe( 'Subsequent access', function () {

                    var jQueryData, retrieved;

                    beforeEach( function () {
                        $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

                        // First access (return values not recorded)
                        Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                        $templateNode.data();
                    } );

                    describe( 'After second retrieval, when the attributes have been altered in the DOM,', function () {

                        beforeEach( function () {
                            $templateNode.attr( combine( modifiedDefaultDataAttrs, modifiedRegisteredCustomDataAttrs, modifiedOtherCustomDataAttrs ) );

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

                        } );

                    } );

                    describe( 'After second retrieval, when the attributes have been removed from the DOM,', function () {

                        beforeEach( function () {
                            var keys = _.keys( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

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

                        } );

                        describe( 'jQuery data', function () {

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

                        } );

                    } );

                } );

            } );

            describe( 'The jQuery data cache is updated from the DOM with updateJqueryDataCache()', function () {

                // NB updateJqueryDataCache() is an internal tool which only acts on an existing jQuery data cache, but
                // does not create one from scratch. See the JS doc of _updateJQueryDataCache().

                var jQueryData;

                beforeEach( function () {
                    $templateNode.attr( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

                    // First access (return values not recorded)
                    Backbone.DeclarativeViews.plugins.getDataAttributes( $templateNode );
                    $templateNode.data();
                } );

                describe( 'When the attributes have been altered in the DOM, the jQuery data object', function () {

                    beforeEach( function () {
                        $templateNode.attr( combine( modifiedDefaultDataAttrs, modifiedRegisteredCustomDataAttrs, modifiedOtherCustomDataAttrs ) );

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

                } );

                describe( 'When the attributes have been removed from the DOM, the jQuery data object', function () {

                    beforeEach( function () {
                        var keys = _.keys( combine( defaultDataAttrs, registeredCustomDataAttrs, otherCustomDataAttrs ) );

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

                } );

            } );

        } );
        
    } );

})();