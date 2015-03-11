require( [

    'underscore',
    'backbone',
    'marionette',
    'usertiming',
    'local.base',
    'backbone.declarative.views',
    'marionette.declarativeviews.integration'

], function ( _, Backbone, Marionette, performance, base ) {

    var count = 1000,

        ItemView = Marionette.ItemView.extend( { template: "#item-template" } ),

        ListView = Marionette.CollectionView.extend( {

            template: "#list-template",

            childView: ItemView,

            parent: ".container",

            initialize: function ( options ) {
                options || ( options = {} );

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

        } ),

        listView = new ListView( { collection: base.Collection.create( count ) } );

    new base.StatsView();
    listView.render();

} );
