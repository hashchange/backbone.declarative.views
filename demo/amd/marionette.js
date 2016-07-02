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
