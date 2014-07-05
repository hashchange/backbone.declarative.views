/*global describe, it */
(function () {
    "use strict";

    var View, view, baseTemplateHtml, $templateNode, dataAttributes, attributesAsProperties;

    describe( 'Basic tests', function () {

        beforeEach( function () {

            baseTemplateHtml = '<script id="template" type="text/x-template"></script>';

            dataAttributes = {
                "data-tag-name": "section",
                "data-class-name": "dataClass",
                "data-id": "dataId",
                "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
            };

            attributesAsProperties = {
                tagName: "section",
                className: "dataClass",
                id: "dataId",
                attributes: { lang: "en", title: "title from data attributes" }
            };

            $templateNode = $( baseTemplateHtml ).appendTo( "body" );

        } );

        afterEach( function () {
            $templateNode.remove();
        } );

        describe( 'Basics', function () {

            describe( 'A template exists and has data attributes describing the el.', function () {

                describe( 'When the template is referenced in the template property of a view', function () {

                    beforeEach( function () {

                        $templateNode.attr( _.extend(
                            dataAttributes,
                            { "data-foo": "bar" }
                        ) );

                        View = Backbone.View.extend( { template: "#template" } );
                        view = new View();

                    } );

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

                describe( 'When the template HTML is stored as a string in the template property of a view', function () {

                    var templateHtml;

                    beforeEach( function () {
                        dataAttributes = {
                            "data-tag-name": "ul",
                            "data-class-name": "listClass",
                            "data-id": "listId",
                            "data-attributes": '{ "lang": "en", "title": "title from data attributes" }',
                            "data-foo": "bar"
                        };

                        // Construct the HTML string
                        templateHtml = $( '<li class="bullet"></li>' )
                            .attr( dataAttributes )
                            .prop( 'outerHTML' );

                        View = Backbone.View.extend( { template: templateHtml } );
                        view = new View();
                    } );

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

                    it( 'data attributes get picked up from the first element in the template HTML if there are multiple ones', function () {

                        // Construct the HTML string
                        templateHtml = '<p class="first" data-tag-name="article"></p><p class="second"></p>';

                        View = Backbone.View.extend( { template: templateHtml } );
                        view = new View();

                        expect( view.$el.prop( "tagName" ).toLowerCase() ).to.equal( "article" );
                    } );

                } );

            } );

            describe( 'Backbone default behaviour remains unchanged', function () {

                it( 'when the view does not reference a template', function () {
                    View = Backbone.View.extend();
                    expect( View ).to.createElWithStandardMechanism;
                } );

                it( 'when the view references a template, but it does not have data attributes describing the el', function () {
                    View = Backbone.View.extend( { template: "#template" } );
                    expect( View ).to.createElWithStandardMechanism;
                } );

                it( 'when the view references a template which does not exist', function () {
                    View = Backbone.View.extend( { template: "#doesNotExist" } );
                    expect( View ).to.createElWithStandardMechanism;
                } );

                it( 'when the view has a template property, but it is a function rather than a selector', function () {
                    View = Backbone.View.extend( { template: function () {
                        return "<article></article>";
                    } } );

                    expect( View ).to.createElWithStandardMechanism;
                } );

            } );

        } );

        describe( 'Setting the template property', function () {

            beforeEach( function () {
                $templateNode.attr( dataAttributes );
            } );

            describe( 'The view does not have a template property initially, but it gets created during instantiation.', function () {

                it( 'The template data attributes get applied to the el of the view if the template selector is passed in as an option', function () {
                    View = Backbone.View.extend();
                    view = new View( { template: "#template" } );

                    expect( view ).to.have.exactElProperties( attributesAsProperties );
                } );

                it( 'The template data attributes do not get applied to the view if the template selector is created and set during initialize', function () {
                    View = Backbone.View.extend( {
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
                    View = Backbone.View.extend( {
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

            beforeEach( function () {
                $templateNode.attr( dataAttributes );
            } );

            describe( 'Properties of el, defined in the template with data attributes, are overridden', function () {

                it( 'by an instance property', function () {
                    View = Backbone.View.extend( {
                        template: "#template",
                        tagName: "article",
                        id: "setInInstanceProperty"
                    } );
                    view = new View();

                    _.extend( attributesAsProperties, { tagName: "article", id: "setInInstanceProperty" } );
                    expect( view ).to.have.exactElProperties( attributesAsProperties );
                } );

                it( 'by an option passed in during instantiation', function () {
                    View = Backbone.View.extend( { template: "#template" } );
                    view = new View( { tagName: "article", id: "setInInstanceProperty" } );

                    _.extend( attributesAsProperties, { tagName: "article", id: "setInInstanceProperty" } );
                    expect( view ).to.have.exactElProperties( attributesAsProperties );
                } );

            } );

        } );

        describe( 'View attached to an el already existing in the DOM', function () {

            var $existingEl;

            beforeEach( function () {
                $existingEl = $( '<article id="preExisting" class="container inDom"></article>' ).appendTo( "body" );
            } );

            describe( 'Backbone default behaviour remains unchanged', function () {

                it( 'when the view does not reference a template', function () {
                    View = Backbone.View.extend();
                    expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                } );

                it( 'when the view references a template, but it does not have data attributes describing the el', function () {
                    View = Backbone.View.extend( { template: "#template" } );
                    expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                } );

                it( 'when the view references a template, even when it has data attributes describing the el', function () {
                    // data attributes get ignored
                    $templateNode.attr( dataAttributes );
                    View = Backbone.View.extend( { template: "#template" } );
                    expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                } );

                it( 'when the view references a template which does not exist', function () {
                    View = Backbone.View.extend( { template: "#doesNotExist" } );
                    expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                } );

                it( 'when the view has a template property, but it is a function rather than a selector', function () {
                    View = Backbone.View.extend( { template: function () {
                        return "<article></article>";
                    } } );

                    expect( View ).to.useExistingElWithoutAlteringIt( $existingEl );
                } );

            } );

        } );

    } );

})();