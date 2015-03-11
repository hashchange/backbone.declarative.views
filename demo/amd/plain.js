require( [

    'underscore',
    'backbone',
    'usertiming',
    'local.base',
    'backbone.declarative.views'

], function ( _, Backbone, performance, base ) {

    Backbone.DeclarativeViews.custom.compiler = function ( templateHtml ) {
        return _.template( templateHtml );
    };

    var count = 1000,

        ItemView = Backbone.View.extend( {

            template: "#item-template",

            initialize: function ( options ) {
                var compiledTemplate = this.declarativeViews.getCachedTemplate().compiled;
                this.template = compiledTemplate || _.template( this.declarativeViews.getCachedTemplate(). html );
            },

            render: function () {
                this.$el.html( this.template( this.model.attributes ) );
            }

        } ),

        ListView = Backbone.View.extend( {

            template: "#list-template",

            parent: ".container",

            initialize: function ( options ) {
                options || ( options = {} );

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
                    var itemView = new ItemView( { model: model } );
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

        } ),

        listView = new ListView( { collection: base.Collection.create( count ) } );

    new base.StatsView();
    listView.render();

} );
