// base.js

define( [

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
