// base.js

define( 'local.base',[

    'underscore',
    'backbone',
    'usertiming',
    'backbone.declarative.views'

], function ( _, Backbone, performance ) {

    var eventBus = _.extend( {}, Backbone.Events ),

        Model = Backbone.Model.extend(),

        Collection = Backbone.Collection.extend(
            { model: Model },
            {
                create: function ( modelCount ) {
                    var i,
                        collection = new Collection(),
                        models = [];

                    for ( i = 0; i < modelCount; i++ ) models.push( new collection.model( { number: i + 1 } ) );
                    collection.reset( models );

                    return collection;
                }
            }
        ),

        StatsView = Backbone.View.extend( {

            template: "#stats-template",

            parent: ".stats",

            initialize: function ( options ) {
                var compiledTemplate = this.declarativeViews.getCachedTemplate().compiled;
                this.template = compiledTemplate || _.template( this.declarativeViews.getCachedTemplate(). html );

                options || ( options = {} );

                if ( options.parent ) this.parent = options.parent;
                this.$parent = Backbone.$( this.parent );
                this.$el.appendTo( this.$parent );

                this.listenTo( eventBus, "createStats", this.render );
            },

            render: function ( stats ) {
                stats.totalDuration = Math.round( this.getTotalDuration() );
                this.$el.html( this.template( stats ) );
            },

            getTotalDuration: function () {
                // Query the document height. This is to assess the true total render time, including the painting.
                // The calculation of the document height should be blocked by the browser until all item elements have
                // been painted.
                var docHeight = $( document ).height();

                performance.measure( "paint", "create-itemViews-start" );
                return performance.getEntriesByName( "paint" )[0].duration;
            }

        } );

    Backbone.DeclarativeViews.custom.compiler = _.template;

    return {
        Model: Model,
        Collection: Collection,
        StatsView: StatsView,
        eventBus: eventBus
    }

} );

// views-marionette.js

define( 'local.views-marionette',[

    'underscore',
    'backbone',
    'marionette',
    'usertiming',
    'local.base',
    'backbone.declarative.views'

], function ( _, Backbone, Marionette, performance, base ) {

    var ItemView = Marionette.ItemView.extend( {
        
            appendTo: function ( $parent ) {
                if ( !( $parent instanceof Backbone.$ ) ) $parent = Backbone.$( $parent );
                $parent.append( this.$el );
                return this;
            }
        
        } ),

        ListView = Marionette.CollectionView.extend( {
            
            initialize: function ( options ) {
                options || ( options = {} );                                // jshint ignore:line

                if ( options.parent ) this.parent = options.parent;
                this.$parent = Backbone.$( this.parent );
            },

            onBeforeRender: function () {
                // Start timer
                performance.clearMarks();
                performance.clearMeasures();
                performance.mark( "create-itemViews-start" );
            },

            onRender: function () {
                var duration;

                // Measure the time it took to create the itemViews
                performance.measure( "create-itemViews", "create-itemViews-start" );
                duration = performance.getEntriesByName( "create-itemViews" )[0].duration;

                if ( ! this.$el.parent().length ) this.$el.appendTo( this.$parent );

                base.eventBus.trigger( "createStats", { itemViewCount : this.children.length, duration: Math.round( duration ) } );
            }

        } );

    return {
        ItemView: ItemView,
        ListView: ListView
    }

} );

// marionette.js

require( [

    'local.base',
    'local.views-marionette'

], function ( base, marionetteViews ) {

    var count = 1000,

        ItemView = marionetteViews.ItemView.extend( { template: "#item-template" } ),

        listView = new marionetteViews.ListView( {
            template: "#list-template",
            childView: ItemView,
            parent: ".container",
            collection: base.Collection.create( count ) 
        } );

    new base.StatsView();
    listView.render();

} );

define("local.marionette", function(){});

