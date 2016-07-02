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
