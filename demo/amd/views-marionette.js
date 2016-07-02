requirejs.config( {

    shim: {
        'backbone.declarative.views': {
            deps: ['marionette']
        }
    }

} );

define( [

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
