/*global describe, it */
(function () {
    "use strict";

    var View, view, $templateNode, dataAttributes, attributesAsProperties;

    // These tests require that Marionette has been loaded (after Backbone.Declarative.Views). We also make sure
    // joinMarionette() has been called.
    Backbone.DeclarativeViews.joinMarionette();

    describe( 'Tests with Marionette views', function () {

        before( function () {
            Backbone.DeclarativeViews.clearCache();
            Backbone.Marionette.TemplateCache.clear();
        } );

        beforeEach( function () {

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

            $templateNode = $( '<script id="template" type="text/x-template"></script>' ).appendTo( "body" );

        } );

        afterEach( function () {
            $templateNode.remove();
        } );

        after( function () {
            Backbone.DeclarativeViews.clearCache();
            Backbone.Marionette.TemplateCache.clear();
        } );

        describe( 'Tests with Marionette.View (Marionette 3) / Marionette.ItemView (Marionette 2)', function () {

            describe( 'Basics', function () {

                describe( 'A template is referenced in the template property of a view. The template exists and has data attributes describing the el.', function () {

                    var cleanup = function () {
                        Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                    };

                    before ( cleanup );

                    beforeEach( function () {

                        $templateNode.attr( _.extend(
                            dataAttributes,
                            { "data-foo": "bar" }
                        ) );

                        View = getMarionetteView().extend( { template: "#template" } );
                        view = new View();

                    } );

                    after( cleanup );

                    it( 'the data-tag-name attribute gets applied to the el', function () {
                        expect( view.$el.prop( "tagName" ).toLowerCase() ).to.equal( dataAttributes["data-tag-name"] );
                    } );

                    it( 'the data-class-name attribute gets applied to the el', function () {
                        expect( view.$el.attr( "class" ) ).to.equal( dataAttributes["data-class-name"] );
                    } );

                    it( 'the data-id attribute gets applied to the el', function () {
                        expect( view.$el.attr( "id" ) ).to.equal( dataAttributes["data-id"] );
                    } );

                    it( 'the content of the data-attributes, a JSON hash, gets transformed into el attributes', function () {
                        var attributes = JSON.parse( dataAttributes["data-attributes"] );
                        expect( view.$el.attr( "lang" ) ).to.equal( attributes.lang );
                        expect( view.$el.attr( "title" ) ).to.equal( attributes.title );
                    } );

                    it( 'other, arbitrary data attributes do not get transformed into el attributes', function () {
                        var elAttributes = {};
                        _.each( view.el.attributes, function ( attribute ) {
                            if ( !_.isUndefined( attribute.nodeValue ) ) elAttributes[attribute.nodeName] = attribute.nodeValue;
                        } );

                        expect( elAttributes ).not.to.have.a.property( "foo" );
                    } );

                } );

                describe( 'Backbone default behaviour remains unchanged', function () {

                    var cleanup = function () {
                        Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#doesNotExist" );
                    };

                    before ( cleanup );

                    after( cleanup );

                    it( 'when the view does not reference a template', function () {
                        View = getMarionetteView().extend();
                        expect( View ).to.createElWithStandardMechanism;
                    } );

                    it( 'when the view references a template, but it does not have data attributes describing the el', function () {
                        View = getMarionetteView().extend( { template: "#template" } );
                        expect( View ).to.createElWithStandardMechanism;
                    } );

                    it( 'when the view references a template which does not exist', function () {
                        View = getMarionetteView().extend( { template: "#doesNotExist" } );
                        expect( View ).to.createElWithStandardMechanism;
                    } );

                    it( 'when the view has a template property, but it is a function rather than a selector', function () {
                        View = getMarionetteView().extend( { template: function () {
                            return "<article></article>";
                        } } );

                        expect( View ).to.createElWithStandardMechanism;
                    } );

                } );

                describe( 'Template rendering by Marionette still works', function () {

                    var model, expectedHtml,
                        cleanup = function () {
                            Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                        };

                    before ( cleanup );

                    beforeEach( function () {

                        $templateNode
                            .attr( dataAttributes )
                            .html( "<p>The foo property of the model is set to <%= foo %></p>" );

                        model = new Backbone.Model( { foo: "bar" } );

                        expectedHtml = "<p>The foo property of the model is set to bar</p>";
                    } );

                    after( cleanup );

                    it( 'when a template property is set by extending Marionette.View/Marionette.ItemView', function () {
                        View = getMarionetteView().extend( { template: "#template" } );
                        view = new View( { model: model } );
                        view.render();

                        expect( view.$el.html() ).to.equal( expectedHtml );
                    } );

                    it( 'when a template is passed in as an option during instantiation', function () {
                        View = getMarionetteView().extend();
                        view = new View( { model: model, template: "#template" } );
                        view.render();

                        expect( view.$el.html() ).to.equal( expectedHtml );
                    } );

                } );

            } );

            describe( 'Setting the template property', function () {

                var cleanup = function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                };

                before ( cleanup );

                beforeEach( function () {
                    $templateNode.attr( dataAttributes );
                } );

                after( cleanup );

                describe( 'The view does not have a template property initially, but it gets created during instantiation.', function () {

                    it( 'The template data attributes get applied to the el of the view if the template selector is passed in as an option', function () {
                        View = getMarionetteView().extend();
                        view = new View( { template: "#template" } );

                        expect( view ).to.have.exactElProperties( attributesAsProperties );
                    } );

                    it( 'The template data attributes do not get applied to the view if the template selector is created and set during initialize', function () {
                        View = getMarionetteView().extend( {
                            initialize: function () {
                                this.template = "#template";
                            }
                        } );
                        view = new View();

                        expect( view ).to.not.have.elProperties( attributesAsProperties );
                    } );

                } );

                describe( 'The view has a template property, and it is a selector initially.', function () {

                    it( 'When the selector is overwritten in initialize, the template data attributes still get applied to the el of the view', function () {
                        View = getMarionetteView().extend( {
                            template: "#template",
                            initialize: function () {
                                this.template = function () { return "template content" };
                            }
                        } );
                        view = new View();

                        expect( view ).to.have.exactElProperties( attributesAsProperties );
                    } );
                } );

            } );

            describe( 'Overrides', function () {

                var cleanup = function () {
                    Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
                };

                before ( cleanup );

                beforeEach( function () {
                    $templateNode.attr( dataAttributes );
                } );

                after( cleanup );

                describe( 'Properties of el, defined in the template with data attributes, are overridden', function () {

                    it( 'by an instance property', function () {
                        View = getMarionetteView().extend( {
                            template: "#template",
                            tagName: "article",
                            id: "setInInstanceProperty"
                        } );
                        view = new View();

                        _.extend( attributesAsProperties, { tagName: "article", id: "setInInstanceProperty" } );
                        expect( view ).to.have.exactElProperties( attributesAsProperties );
                    } );

                    it( 'by an option passed in during instantiation', function () {
                        View = getMarionetteView().extend( { template: "#template" } );
                        view = new View( { tagName: "article", id: "setInInstanceProperty" } );

                        _.extend( attributesAsProperties, { tagName: "article", id: "setInInstanceProperty" } );
                        expect( view ).to.have.exactElProperties( attributesAsProperties );
                    } );

                } );

            } );

            describe( 'View attached to an el already existing in the DOM', function () {

                var $existingEl,
                    cleanup = function () {
                        Backbone.DeclarativeViews.clearCachedTemplate( "#template", "#doesNotExist" );
                    };

                before ( cleanup );

                beforeEach( function () {
                    $existingEl = $( '<article id="preExisting" class="container inDom"></article>' ).appendTo( "body" );
                } );

                after( cleanup );

                describe( 'Backbone default behaviour remains unchanged', function () {

                    it( 'when the view does not reference a template', function () {
                        View = getMarionetteView().extend();
                        expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                    } );

                    it( 'when the view references a template, but it does not have data attributes describing the el', function () {
                        View = getMarionetteView().extend( { template: "#template" } );
                        expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                    } );

                    it( 'when the view references a template, even when it has data attributes describing the el', function () {
                        // data attributes get ignored
                        $templateNode.attr( dataAttributes );
                        View = getMarionetteView().extend( { template: "#template" } );
                        expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                    } );

                    it( 'when the view references a template which does not exist', function () {
                        View = getMarionetteView().extend( { template: "#doesNotExist" } );
                        expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                    } );

                    it( 'when the view has a template property, but it is a function rather than a selector', function () {
                        View = getMarionetteView().extend( { template: function () {
                            return "<article></article>";
                        } } );

                        expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                    } );

                } );

            } );

        } );

        describe( 'Tests with Marionette.CollectionView', function () {

            var $listTemplateNode, listDataAttributes, listAttributesAsProperties, model, collection;

            before( function () {
                Backbone.DeclarativeViews.clearCache();
                Backbone.Marionette.TemplateCache.clear();
            } );

            beforeEach( function () {

                model = new Backbone.Model( { foo: "bar" } );
                collection = new Backbone.Collection( [model] );

                listDataAttributes = {
                    "data-tag-name": "main",
                    "data-class-name": "dataListClass",
                    "data-id": "dataListId",
                    "data-attributes": '{ "lang": "de", "title": "list title from data attributes" }'
                };

                // Equivalent of the data attributes as a hash of el properties. Written out for clarity, but could simply
                // have been transformed with the test helper function dataAttributesToProperties( listDataAttributes ).
                listAttributesAsProperties = {
                    tagName: "main",
                    className: "dataListClass",
                    id: "dataListId",
                    attributes: { lang: "de", title: "list title from data attributes" }
                };

                $listTemplateNode = $( '<script id="listTemplate" type="text/x-template"></script>' ).appendTo( "body" );

                $listTemplateNode.attr( _.extend(
                    listDataAttributes,
                    { "data-baz": "qux" }
                ) );

                $templateNode.attr( _.extend(
                    dataAttributes,
                    { "data-foo": "bar" }
                ) );

            } );

            afterEach( function () {
                Backbone.DeclarativeViews.clearCache();
                Backbone.Marionette.TemplateCache.clear();
                $listTemplateNode.remove();
            } );

            describe( 'A template is referenced in the template property of a collection view. The template exists and has data attributes describing the el.', function () {

                beforeEach( function () {

                    View = Backbone.Marionette.CollectionView.extend( {
                        template: "#listTemplate",
                        childView: getMarionetteView()
                    } );

                    view = new View();

                } );

                it( 'the data-tag-name attribute gets applied to the el', function () {
                    expect( view.$el.prop( "tagName" ).toLowerCase() ).to.equal( listDataAttributes["data-tag-name"] );
                } );

                it( 'the data-class-name attribute gets applied to the el', function () {
                    expect( view.$el.attr( "class" ) ).to.equal( listDataAttributes["data-class-name"] );
                } );

                it( 'the data-id attribute gets applied to the el', function () {
                    expect( view.$el.attr( "id" ) ).to.equal( listDataAttributes["data-id"] );
                } );

                it( 'the content of the data-attributes, a JSON hash, gets transformed into el attributes', function () {
                    var attributes = JSON.parse( listDataAttributes["data-attributes"] );
                    expect( view.$el.attr( "lang" ) ).to.equal( attributes.lang );
                    expect( view.$el.attr( "title" ) ).to.equal( attributes.title );
                } );

                it( 'other, arbitrary data attributes do not get transformed into el attributes', function () {
                    var elAttributes = {};
                    _.each( view.el.attributes, function ( attribute ) {
                        if ( !_.isUndefined( attribute.nodeValue ) ) elAttributes[attribute.nodeName] = attribute.nodeValue;
                    } );

                    expect( elAttributes ).not.to.have.a.property( "baz" );
                } );

            } );

            describe( 'A template is referenced in the template property of the item view class which is associated with a collection view. The template exists and has data attributes describing the el of each item view.', function () {

                var childView;

                beforeEach( function () {

                    var ChildView = getMarionetteView().extend( { template: "#template" } );

                    View = Backbone.Marionette.CollectionView.extend( {
                        template: "#listTemplate",
                        childView: ChildView,
                        collection: collection
                    } );

                    view = new View();
                    view.render();
                    childView = view.children.findByModel( model );

                } );

                it( 'the data-tag-name attribute gets applied to the el', function () {
                    expect( childView.$el.prop( "tagName" ).toLowerCase() ).to.equal( dataAttributes["data-tag-name"] );
                } );

                it( 'the data-class-name attribute gets applied to the el', function () {
                    expect( childView.$el.attr( "class" ) ).to.equal( dataAttributes["data-class-name"] );
                } );

                it( 'the data-id attribute gets applied to the el', function () {
                    expect( childView.$el.attr( "id" ) ).to.equal( dataAttributes["data-id"] );
                } );

                it( 'the content of the data-attributes, a JSON hash, gets transformed into el attributes', function () {
                    var attributes = JSON.parse( dataAttributes["data-attributes"] );
                    expect( childView.$el.attr( "lang" ) ).to.equal( attributes.lang );
                    expect( childView.$el.attr( "title" ) ).to.equal( attributes.title );
                } );

                it( 'other, arbitrary data attributes do not get transformed into el attributes', function () {
                    var elAttributes = {};
                    _.each( childView.el.attributes, function ( attribute ) {
                        if ( !_.isUndefined( attribute.nodeValue ) ) elAttributes[attribute.nodeName] = attribute.nodeValue;
                    } );

                    expect( elAttributes ).not.to.have.a.property( "foo" );
                } );

            } );

            describe( 'Template rendering by Marionette still works', function () {

                var expectedItemViewHtml;

                beforeEach( function () {
                    $templateNode
                        .attr( dataAttributes )
                        .html( "<p>The foo property of the model is set to <%= foo %></p>" );

                    expectedItemViewHtml = "<p>The foo property of the model is set to bar</p>";
                } );

                it( 'when a template property is set by extending Marionette.CollectionView and the associated Marionette.View/Marionette.ItemView', function () {
                    var childView,
                        ChildView = getMarionetteView().extend( { template: "#template" } );

                    View = Backbone.Marionette.CollectionView.extend( {
                        template: "#listTemplate",
                        childView: ChildView,
                        collection: collection
                    } );

                    view = new View();
                    view.render();
                    childView = view.children.findByModel( model );

                    expect( view.$el.children() ).to.have.length( 1 );
                    expect( view.$el.children()[0] ).to.equal( childView.el );
                    expect( childView.$el.html() ).to.equal( expectedItemViewHtml );
                } );

                it( 'when a template for the collection view, as well as for the item views, is passed in as an option during instantiation', function () {
                    var childView,
                        ChildView = getMarionetteView();

                    View = Backbone.Marionette.CollectionView.extend( {
                        childView: ChildView,
                        collection: collection
                    } );

                    view = new View( {
                        template: "#listTemplate",
                        childViewOptions: { template: "#template" }
                    } );

                    view.render();
                    childView = view.children.findByModel( model );

                    expect( view.$el.children() ).to.have.length( 1 );
                    expect( view.$el.children()[0] ).to.equal( childView.el );
                    expect( childView.$el.html() ).to.equal( expectedItemViewHtml );
                } );

            } );

        } );

    } );

})();