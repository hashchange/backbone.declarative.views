/*global describe, it */
(function () {
    "use strict";

    describe( 'Default loader modification', function () {

        var dataAttributes, outerTemplateHtml, innerTemplateHtml, View,
            originalLoader,
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

            originalLoader = Backbone.DeclarativeViews.defaults.loadTemplate;

            Backbone.DeclarativeViews.defaults.loadTemplate = function () {
                return $( outerTemplateHtml );
            };

            View = Backbone.View.extend();
        } );

        afterEach( function () {
            cleanup();
            Backbone.DeclarativeViews.defaults.loadTemplate = originalLoader;
        } );

        describe( 'The (modified) default loadTemplate method receives as argument', function () {

            beforeEach( function () {
                sinon.spy( Backbone.DeclarativeViews.defaults, "loadTemplate" );
            } );

            afterEach( function () {
                Backbone.DeclarativeViews.defaults.loadTemplate.restore();
            } );

            it( 'the template property of the view, if the template has been specified that way', function () {
                View = Backbone.View.extend( { template: "#template" } );
                new View();
                expect( Backbone.DeclarativeViews.defaults.loadTemplate ).to.have.been.calledWith( "#template" );
            } );

            it( 'the template option passed to the view, if the template has been specified that way', function () {
                new View( { template: "#template" } );
                expect( Backbone.DeclarativeViews.defaults.loadTemplate ).to.have.been.calledWith( "#template" );
            } );

            it( 'the template option passed to the view, if the template has been specified as a property but been overridden with the option', function () {
                View = Backbone.View.extend( { template: "#template" } );
                new View( { template: "#otherTemplate" } );
                expect( Backbone.DeclarativeViews.defaults.loadTemplate ).to.have.been.calledWith( "#otherTemplate" );
            } );

        } );

        describe( 'When the jQuery object of the template is provided by a (modified) default loadTemplate method', function () {

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
                expect( view.declarativeViews.getCachedTemplate() ).to.returnCacheValueFor( dataAttributes, outerTemplateHtml );
            } );

            it( 'its outer HTML is produced by the outerHtml function which is returned by the cache', function () {
                var retrieved = view.declarativeViews.getCachedTemplate();
                expect( retrieved.outerHtml ).to.be.a( "function" );
                expect( retrieved.outerHtml() ).to.equal( outerTemplateHtml );
            } );

            it( 'its inner HTML is returned as the template HTML by the cache', function () {
                expect( view.declarativeViews.getCachedTemplate().html ).to.eql( innerTemplateHtml );
            } );

        } );

        describe( 'Backbone default behaviour remains unchanged', function () {

            it( 'when the view does not reference a template', function () {
                View = Backbone.View.extend();
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view references a template, but the return value of the default loader does not have data attributes describing the el', function () {
                Backbone.DeclarativeViews.defaults.loadTemplate = function () { return $( "<div>Some HTML</div>" ); };
                View = Backbone.View.extend( { template: "#noDataAttr" } );
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view references a template with a string that the default loader cannot process, throwing a generic error', function () {
                // NB ... but if the loader raises the alarm deliberately and throws one of the error types belonging to
                // Backbone.DeclarativeViews, business as usual is over: the exception is rethrown and bubbles up. See
                // test further below.
                Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                View = Backbone.View.extend( { template: "#throwsError" } );
                expect( View ).to.createElWithStandardMechanism;
            } );

            it( 'when the view has a template property, but it is a function rather than a selector', function () {
                // That is because only string properties get forwarded to the cache mechanism, and eventually to the
                // default loader.
                View = Backbone.View.extend( { template: function () {
                    return "<article></article>";
                } } );

                expect( View ).to.createElWithStandardMechanism;
            } );

        } );

        describe( 'A Marionette view remains true to its standard behaviour and throws an error on render(), or maybe even earlier', function () {

            it( 'when the view does not reference a template', function () {
                View = Backbone.Marionette.ItemView.extend();
                var view = new View();
                expect( function () { view.render(); } ).to.throw( Error );
            } );

            it( 'when the view references a template for which the default loader returns undefined', function () {
                // This already blows up when the view is instantiated because the invalid return value becomes a
                // problem not during render(), but when the el is constructed.
                Backbone.DeclarativeViews.defaults.loadTemplate = function () {};
                View = Backbone.Marionette.ItemView.extend( { template: "#returnsVoid" } );

                expect( function () {
                        var view = new View();
                        view.render(); }
                ).to.throw( Error );
            } );

            it( 'when the view references a template with a string that the default loader cannot process, throwing an error', function () {
                Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Error( "loadTemplate blew up" ); };
                View = Backbone.Marionette.ItemView.extend( { template: "#throwsError" } );
                var view = new View();
                expect( function () { view.render(); } ).to.throw( Error );
            } );

        } );

        describe( 'Default loader error checking', function () {

            describe( 'A friendly error is thrown', function () {

                it( 'when the (modified) default loader returns a value without throwing an error, but that value is not a jQuery object', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () { return "<div>Returned template HTML is not wrapped in jQuery object</div>" };
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.CustomizationError, "Invalid return value. The default loadTemplate function must return a jQuery instance" );
                } );

                it( 'when the (modified) default loader returns undefined without throwing an error', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () {};
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.CustomizationError, "Invalid return value. The default loadTemplate function must return a jQuery instance" );
                } );

            } );

            describe( 'An error raised deliberately in the (modified) default loader, with one of the error types in Backbone.DeclarativeViews, bubbles up uncaught', function () {

                // Generic errors in the loader are caught and suppressed, and Backbone just creates a standard el (see
                // tests above). However, he error types of Backbone.DeclarativeViews are allowed to bubble up. That
                // way, a default loader can bypass the error handling and raise the alarm if it needs to.

                it( 'when that error is of type Backbone.Backbone.DeclarativeViews.Error', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Backbone.DeclarativeViews.Error( "a message from the loader" ); };
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.Error, "a message from the loader" );
                } );

                it( 'when that error is of type Backbone.Backbone.DeclarativeViews.TemplateError', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Backbone.DeclarativeViews.TemplateError( "a message from the loader" ); };
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.TemplateError, "a message from the loader" );
                } );

                it( 'when that error is of type Backbone.Backbone.DeclarativeViews.CompilerError', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Backbone.DeclarativeViews.CompilerError( "a message from the loader" ); };
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.CompilerError, "a message from the loader" );
                } );

                it( 'when that error is of type Backbone.Backbone.DeclarativeViews.CustomizationError', function () {
                    Backbone.DeclarativeViews.defaults.loadTemplate = function () { throw new Backbone.DeclarativeViews.CustomizationError( "a message from the loader" ); };
                    expect( function () { new View( { template: "#template" } ); } ).to.throw( Backbone.DeclarativeViews.CustomizationError, "a message from the loader" );
                } );

            } );

        } );


    } );

})();