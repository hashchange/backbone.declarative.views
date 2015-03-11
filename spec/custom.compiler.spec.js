/*global describe, it */
(function () {
    "use strict";

    describe( 'Custom template compiler', function () {

        var dataAttributes, innerTemplateHtml, outerTemplateHtml, $templateNode, View,
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

            var baseTemplateHtml = '<script id="template" type="text/x-template"></script>';
            innerTemplateHtml = '<li class="innerItem">Inner list item</li>';

            $templateNode = $( baseTemplateHtml )
                .html( innerTemplateHtml )
                .attr( dataAttributes )
                .appendTo( "body" );

            outerTemplateHtml = $templateNode.prop( "outerHTML" ) ;

            Backbone.DeclarativeViews.custom.compiler = function ( html, $template ) {
                return _.template( html );
            };

            View = Backbone.View.extend();
        } );

        afterEach( function () {
            cleanup();
            $templateNode.remove();
            Backbone.DeclarativeViews.custom.compiler = undefined;
        } );

        describe( 'The custom compiler method receives', function () {

            var compilerSpy;

            beforeEach( function () {
                compilerSpy = sinon.spy( Backbone.DeclarativeViews.custom, "compiler" );
                new View( { template: "#template" } );
            } );

            afterEach( function () {
                Backbone.DeclarativeViews.custom.compiler.restore();
            } );

            it( 'exactly two arguments', function () {
                expect( Backbone.DeclarativeViews.custom.compiler.getCall( 0 ).args ).to.be.of.length( 2 );
            } );

            it( 'the inner HTML of the template as the first argument', function () {
                expect( Backbone.DeclarativeViews.custom.compiler ).to.have.been.calledWith( innerTemplateHtml );
            } );

            it( 'the $template node, wrapped in a jQuery object, as the second argument', function () {
                var firstArg = Backbone.DeclarativeViews.custom.compiler.getCall( 0 ).args[1];
                expect( firstArg ).to.be.instanceOf( jQuery );
                expect( firstArg ).to.be.of.length( 1 );
                expect( firstArg.prop( "outerHTML" ) ).to.equal( outerTemplateHtml );
            } );

        } );

        describe( 'The return value of the custom compiler', function () {

            it( 'is allowed to be anything without throwing an error (checking with string return value)', function () {
                // It _should_ be a function, but it is not enforced.
                Backbone.DeclarativeViews.custom.compiler = function () { return "A random string!" };
                expect( function () { new View( { template: "#template" } ); } ).not.to.throw();
            } );

            it( 'is allowed to be anything without throwing an error (checking with undefined return value)', function () {
                // It _should_ be a function, but it is not enforced.
                Backbone.DeclarativeViews.custom.compiler = function () { return undefined; };
                expect( function () { new View( { template: "#template" } ); } ).not.to.throw();
            } );

            it( 'appears as the "compiled" property in the cache entry', function () {
                var view = new View( { template: "#template" } ),
                    cached = view.declarativeViews.getCachedTemplate();

                expect( cached ).to.haveOwnProperty( "compiled" );
                expect( cached.compiled ).to.be.a( "function" );
                expect( cached.compiled() ).to.equal( ( _.template( innerTemplateHtml ) )() );
            } );

        } );

        describe( 'The presence of a custom compiler does not affect', function () {

            var view;

            beforeEach( function () {
                view = new View( { template: "#template" } );
            } );

            it( 'the other cached values', function () {
                expect( view.declarativeViews.getCachedTemplate() ).to.returnCacheValueFor( dataAttributes, outerTemplateHtml, _.template( innerTemplateHtml ) );
            } );

            it( 'the el of the view', function () {
                expect( view ).to.have.exactElProperties( dataAttributesToProperties( dataAttributes ) );
            } );

        } );

        describe( 'If defined, the compiler must be a function. An error is thrown', function () {

            it( 'if it is an object', function () {
                Backbone.DeclarativeViews.custom.compiler = {};
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "Invalid custom template compiler set in Backbone.DeclarativeViews.custom.compiler: compiler is not a function" );
            } );

            it( 'if it is a string', function () {
                Backbone.DeclarativeViews.custom.compiler = "a string";
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "Invalid custom template compiler set in Backbone.DeclarativeViews.custom.compiler: compiler is not a function" );
            } );

            it( 'if it is an array', function () {
                Backbone.DeclarativeViews.custom.compiler = [];
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "Invalid custom template compiler set in Backbone.DeclarativeViews.custom.compiler: compiler is not a function" );
            } );

        } );

        describe( 'If the compiler throws an error when called', function () {

            it( 'Backbone.Declarative.Views throws a (friendly) error', function () {
                Backbone.DeclarativeViews.custom.compiler = function () { throw new Error( "compiler error message" ); };
                expect( function () { new View( { template: "#template" } ); } ).to.throw( Error, "An error occurred while compiling the template" );
            } );

        } );

        describe( 'If no compiler is defined', function () {

            it( 'the "compiled" property in the cache entry is set to undefined', function () {
                Backbone.DeclarativeViews.custom.compiler = undefined;
                var view = new View( { template: "#template" } ),
                    cached = view.declarativeViews.getCachedTemplate();

                expect( cached.compiled ).to.be.undefined;
            } );

        } );

    } );

})();