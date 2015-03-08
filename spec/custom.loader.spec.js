/*global describe, it */
(function () {
    "use strict";

    describe( 'Custom loader', function () {

        var dataAttributes, outerTemplateHtml, innerTemplateHtml, View,
            cleanup = function () {
                Backbone.DeclarativeViews.clearCache();
                Backbone.Marionette.TemplateCache.clear();
            };

        beforeEach( function () {

            cleanup();

            dataAttributes = {
                "data-tag-name": "ul",
                "data-class-name": "listClass",
                "data-id": "listId",
                "data-attributes": '{ "lang": "en", "title": "title from data attributes" }'
            };

            // Construct the HTML strings
            // NB Normalize the template HTML by piping it through jQuery
            innerTemplateHtml = '<li class="innerItem">Inner list item</li>';
            outerTemplateHtml = $( '<div class="wrapper"></div>' )
                .html( innerTemplateHtml )
                .attr( dataAttributes )
                .prop( 'outerHTML' );

            Backbone.DeclarativeViews.custom.loadTemplate = function () {
                return $( outerTemplateHtml );
            };

            View = Backbone.View.extend();
        } );

        afterEach( function () {
            cleanup();
            Backbone.DeclarativeViews.custom.loadTemplate = undefined;
        } );

        describe( 'The custom loadTemplate method receives as argument', function () {

            beforeEach( function () {
                sinon.spy( Backbone.DeclarativeViews.custom, "loadTemplate" );
            } );

            afterEach( function () {
                Backbone.DeclarativeViews.custom.loadTemplate.restore();
            } );

            it( 'the template property of the view, if the template has been specified that way', function () {
                View = Backbone.View.extend( { template: "#template" } );
                new View();
                expect( Backbone.DeclarativeViews.custom.loadTemplate ).to.have.been.calledWith( "#template" );
            } );

            it( 'the template option passed to the view, if the template has been specified that way', function () {
                new View( { template: "#template" } );
                expect( Backbone.DeclarativeViews.custom.loadTemplate ).to.have.been.calledWith( "#template" );
            } );

            it( 'the template option passed to the view, if the template has been specified as a property but been overridden with the option', function () {
                View = Backbone.View.extend( { template: "#template" } );
                new View( { template: "#otherTemplate" } );
                expect( Backbone.DeclarativeViews.custom.loadTemplate ).to.have.been.calledWith( "#otherTemplate" );
            } );

        } );

        describe( 'When the jQuery object of the template is provided by a custom loadTemplate method', function () {

            var view;

            beforeEach( function () {
                view = new View( { template: "#template" } );
            } );

            it( 'its data attributes get applied to the el', function () {
                var attributes = JSON.parse( dataAttributes["data-attributes"] );

                expect( view.el.tagName.toLowerCase() ).to.equal( dataAttributes["data-tag-name"] );
                expect( view.$el.attr( "class" ) ).to.equal( dataAttributes["data-class-name"] );
                expect( view.$el.attr( "id" ) ).to.equal( dataAttributes["data-id"] );
                expect( view.$el.attr( "lang" ) ).to.equal( attributes.lang );
                expect( view.$el.attr( "title" ) ).to.equal( attributes.title );
            } );

            it( 'it gets stored in the cache', function () {
                var expected = _.extend( {},
                    { valid: true, html: innerTemplateHtml },
                    dataAttributesToProperties( dataAttributes )
                );

                expect( view.declarativeViews.getCachedTemplate() ).to.eql( expected );
            } );

            it( 'its inner HTML is returned as the template HTML by the cache', function () {
                expect( view.declarativeViews.getCachedTemplate().html ).to.eql( innerTemplateHtml );
            } );

            it( 'its inner HTML is returned by the Marionette cache, compiled into a template function', function () {
                expect( ( Backbone.Marionette.TemplateCache.get( "#template" ) )() ).to.equal( innerTemplateHtml );
            } );

        } );

        describe( 'Backbone default behaviour remains unchanged', function () {

            it( 'when the view does not reference a template', function () {
                View = Backbone.View.extend();
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view references a template, but the return value of the custom loader does not have data attributes describing the el', function () {
                Backbone.DeclarativeViews.custom.loadTemplate = function () { return $( "<div>Some HTML</div>" ); };
                View = Backbone.View.extend( { template: "#noDataAttr" } );
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view references a template with a string that the custom loader cannot process, throwing an error', function () {
                Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                View = Backbone.View.extend( { template: "#throwsError" } );
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view has a template property, but it is a function rather than a selector', function () {
                // That is because only string properties get forwarded to the cache mechanism, and eventually to the
                // custom loader.
                View = Backbone.View.extend( { template: function () {
                    return "<article></article>";
                } } );

                expect( View ).to.createElWithStandardMechanism;
            } );

        } );

        describe( 'A Marionette view remains true to its standard behaviour and throws an error on render(), at the latest', function () {

            it( 'when the view does not reference a template', function () {
                View = Backbone.Marionette.ItemView.extend();
                var view = new View();
                expect( function () { view.render(); } ).to.throw( Error );
            } );

            it( 'when the view references a template for which the custom loader returns undefined', function () {
                // This already blows up when the view is instantiated because the invalid return value becomes a
                // problem not during render(), but when the el is constructed.
                Backbone.DeclarativeViews.custom.loadTemplate = function () {};
                View = Backbone.Marionette.ItemView.extend( { template: "#returnsVoid" } );

                expect( function () {
                        var view = new View();
                        view.render(); }
                ).to.throw( Error );
            } );

            it( 'when the view references a template with a string that the custom loader cannot process, throwing an error', function () {
                Backbone.DeclarativeViews.custom.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                View = Backbone.Marionette.ItemView.extend( { template: "#throwsError" } );
                var view = new View();
                expect( function () { view.render(); } ).to.throw( Error );
            } );

        } );

        describe( 'Custom loader error checking', function () {

            it( 'When the custom loader returns a value without throwing an error, but that value is not a jQuery object, a friendly error is thrown', function () {
                Backbone.DeclarativeViews.custom.loadTemplate = function () { return "<div>Returned template HTML is not wrapped in jQuery object</div>" };
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "Invalid return value. Custom loadTemplate function must return a jQuery instance" );
            } );

            it( 'When the custom loader returns undefined without throwing an error', function () {
                Backbone.DeclarativeViews.custom.loadTemplate = function () {};
                View = Backbone.View.extend( { template: "#returnsVoid" } );
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "Invalid return value. Custom loadTemplate function must return a jQuery instance" );
            } );

        } );


    } );

})();