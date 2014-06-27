requirejs.config( {

    baseUrl: '../../bower_components',

    paths: {
        'jquery': 'jquery/dist/jquery',
        'underscore': 'underscore/underscore',
        'backbone': 'backbone/backbone',
        'backbone.declarative.views': '/dist/amd/backbone.declarative.views'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
} );

require( [

    'jquery',
    'underscore',
    'backbone',
    'backbone.declarative.views'

], function ( $, _, Backbone ) {


} );
