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

// views-backbone.js

define( 'local.views-backbone',[
    
    'underscore',
    'backbone',
    'usertiming',
    'local.base',
    'backbone.declarative.views'

], function ( _, Backbone, performance, base ) {

    var ItemView = Backbone.View.extend( {

            initialize: function ( options ) {
                this.template = this.declarativeViews.getCachedTemplate().compiled;
            },

            render: function () {
                this.$el.html( this.template( this.model.attributes ) );
                return this;
            },

            appendTo: function ( $parent ) {
                if ( !( $parent instanceof Backbone.$ ) ) $parent = Backbone.$( $parent );
                $parent.append( this.$el );
                return this;
            }

        } ),

        ListView = Backbone.View.extend( {
            
            initialize: function ( options ) {
                options || ( options = {} );                                // jshint ignore:line

                if ( options.ItemView ) this.ItemView = options.ItemView;
                if ( options.parent ) this.parent = options.parent;
                this.$parent = Backbone.$( this.parent );
            },

            render: function () {
                var duration, renderDuration,
                    els = [];

                this.itemViews = [];

                // Start timer
                performance.clearMarks();
                performance.clearMeasures();
                performance.mark( "create-itemViews-start" );

                this.collection.each( function ( model ) {
                    //Backbone.DeclarativeViews.clearCache();
                    var itemView = new this.ItemView( { model: model } );
                    itemView.render();

                    this.itemViews.push( itemView );
                    els.push( itemView.el );
                }, this );

                // Measure itemView creation time
                performance.measure( "create-itemViews", "create-itemViews-start" );
                duration = performance.getEntriesByName( "create-itemViews" )[0].duration;

                this.$el.append( els );
                this.$el.appendTo( this.$parent );

                // Measure render duration time (total from beginning of itemView creation)
                performance.measure( "render", "create-itemViews-start" );
                renderDuration = performance.getEntriesByName( "render" )[0].duration;

                base.eventBus.trigger( "createStats", {
                    itemViewCount : this.itemViews.length,
                    duration: Math.round( duration ),
                    renderDuration: Math.round( renderDuration )
                } );
            },

            destroy: function () {
                _.each( this.itemViews, function ( itemView ) {
                    itemView.remove();
                } );

                this.remove();
            }

        } );

    return {
        ItemView: ItemView,
        ListView: ListView
    }

} );

// plain.js

require( [

    'local.base',
    'local.views-backbone'

], function ( base, backboneViews ) {

    var count = 1000,

        ItemView = backboneViews.ItemView.extend( {
            template: "#item-template"
        } ),

        listView = new backboneViews.ListView( {
            template: "#list-template",
            parent: ".container",
            ItemView: ItemView,
            collection: base.Collection.create( count )
        } );

    new base.StatsView();
    listView.render();

} );

define("local.plain", function(){});

