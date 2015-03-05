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

            attributesAsProperties = {
                tagName: "section",
                className: "dataClass",
                id: "dataId",
                attributes: { lang: "en", title: "title from data attributes" }
            };

            $templateNode = $( baseTemplateHtml ).appendTo( "body" );
            $templateNode.attr( dataAttributes );

        } );

        afterEach( function () {
            $templateNode.remove();
        } );

        after( function () {
            Backbone.DeclarativeViews.clearCachedTemplate( "#template" );
        } );

        describe( 'The declarativeViews "namespace" property', function () {

            beforeEach( function () {
                View = Backbone.View.extend();
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

            describe( 'returns a hash with a valid: false property only', function () {

                beforeEach( function () {
                    View = Backbone.View.extend();
                } );

                it( 'if the template is not specified', function () {
                    view = new View();
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

                it( 'returns returns the inner HTML of the template', function () {
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

                it( 'returns returns the inner HTML of the template', function () {
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

        } );

    } );

})();