// marionette-precompiled.js

require( [

    'local.base',
    'local.views-marionette',
    'marionette.handlebars',
    'precompiled.declarative.handlebars.templates',
    'local.precompiled.templates'

], function ( base, marionetteViews ) {

    var count = 1000,

        ItemView = marionetteViews.ItemView.extend( {
            template: "item-template"  // without leading "#": is ID of precompiled template, not selector
        } ),

        listView = new marionetteViews.ListView( {
            template: "list-template",  // without leading "#"
            childView: ItemView,
            parent: ".container",
            collection: base.Collection.create( count ) 
        } );

    new base.StatsView( { template: "stats-template" } );  // without leading "#"
    listView.render();

} );
