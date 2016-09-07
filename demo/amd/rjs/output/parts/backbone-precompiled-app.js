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

define('local.precompiled.templates',['handlebars.runtime'], function(Handlebars) {
  Handlebars = Handlebars["default"];  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['item-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<!--  data-tag-name=\"li\" data-class-name=\"item\" -->\n"
    + container.escapeExpression(((helper = (helper = helpers.number || (depth0 != null ? depth0.number : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"number","hash":{},"data":data}) : helper)))
    + "\n";
},"useData":true});
templates['list-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<!--\n    data-tag-name=\"ul\"\n    data-class-name=\"list small-block-grid-4 medium-block-grid-8 large-block-grid-10\"\n    no other content - template just exists for the el definition\n-->\n";
},"useData":true});
templates['stats-template'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<!-- data-tag-name=\"p\" data-class-name=\"row\" -->\nGenerating "
    + alias4(((helper = (helper = helpers.itemViewCount || (depth0 != null ? depth0.itemViewCount : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"itemViewCount","hash":{},"data":data}) : helper)))
    + " item views took "
    + alias4(((helper = (helper = helpers.duration || (depth0 != null ? depth0.duration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"duration","hash":{},"data":data}) : helper)))
    + "ms. In total, it took "
    + alias4(((helper = (helper = helpers.renderDuration || (depth0 != null ? depth0.renderDuration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"renderDuration","hash":{},"data":data}) : helper)))
    + "ms until they had all been appended to the DOM. Finally, when painting was over, "
    + alias4(((helper = (helper = helpers.totalDuration || (depth0 != null ? depth0.totalDuration : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"totalDuration","hash":{},"data":data}) : helper)))
    + "ms had passed.\n";
},"useData":true});
return templates;
});

// plain-precompiled.js

require( [

    'local.base',
    'local.views-backbone',
    'precompiled.declarative.handlebars.templates',
    'local.precompiled.templates'

], function ( base, backboneViews ) {

    var count = 1000,

        ItemView = backboneViews.ItemView.extend( {
            template: "item-template"  // without leading "#": is ID of precompiled template, not selector
        } ),

        listView = new backboneViews.ListView( {
            template: "list-template",  // without leading "#"
            parent: ".container",
            ItemView: ItemView,
            collection: base.Collection.create( count )
        } );

    new base.StatsView( { template: "stats-template" } );  // without leading "#"
    listView.render();

} );

define("local.plain-precompiled", function(){});

