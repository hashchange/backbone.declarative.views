// inline-el.js

require( [

    'backbone',
    'local.base',
    'local.views-backbone',
    'local.views-marionette',
    'local.inline-el-plugin'

], function ( Backbone, base, backboneViews, marionetteViews ) {

    // To make the inline `el` magic work with Marionette, the original template must be replaced. Backbone-only views
    // don't need this. Try it by commenting it out.
    Backbone.DeclarativeViews.custom.replaceOriginalTemplates = true;

    var count = 10,

        BackboneListItemView = backboneViews.ItemView.extend( { template: "#item-template" } ),
        MarionetteListItemView = marionetteViews.ItemView.extend( { template: "#item-template" } ),

        backboneListView = new backboneViews.ListView( {
            template: "#list-template-backbone",
            parent: ".container.backbone",
            ItemView: BackboneListItemView,
            collection: base.Collection.create( count )
        } ),

        marionetteListView = new marionetteViews.ListView( {
            template: "#list-template-marionette",
            childView: MarionetteListItemView,
            parent: ".container.marionette",
            collection: base.Collection.create( count )
        } ),
        
        backboneReportView = new backboneViews.ItemView( {
            model: new Backbone.Model( {
                itemViewCount: count,
                framework: "Backbone"
            } ),
            template: "#report-template-backbone"
        } ),
        
        marionetteReportView = new marionetteViews.ItemView( {
            model: new Backbone.Model( {
                itemViewCount: count,
                framework: "Marionette"
            } ),
            template: "#report-template-marionette"
        } );

    backboneListView.render();
    marionetteListView.render();
    
    backboneReportView.render().appendTo( ".report.backbone" );
    marionetteReportView.render().appendTo( ".report.marionette" );

} );
