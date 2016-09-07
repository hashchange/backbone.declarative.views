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
