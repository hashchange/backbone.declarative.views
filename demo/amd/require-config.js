requirejs.config( {

    // Base URL: project root
    baseUrl: '../../',

    paths: {
        'usertiming': 'demo/bower_demo_components/usertiming/src/usertiming',

        // Using a different jQuery here than elsewhere (1.x, instead of 3.x in node_modules and bower_components).
        // Makes the demo work in oldIE, too.
        'jquery': 'demo/bower_demo_components/jquery/dist/jquery',

        // Use this path for switching to jQuery 3.x
        // 'jquery': 'bower_components/jquery/dist/jquery',

        'underscore': 'bower_components/underscore/underscore',
        'backbone': 'bower_components/backbone/backbone',
        'marionette': 'bower_components/marionette/lib/backbone.marionette',

        'backbone.declarative.views': 'dist/backbone.declarative.views',

        'local.base': 'demo/amd/base',
        'local.marionette': 'demo/amd/marionette',
        'local.plain': 'demo/amd/plain',
        'local.views-backbone': 'demo/amd/views-backbone',
        'local.views-marionette': 'demo/amd/views-marionette'
    },

    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'marionette': {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'Marionette'
        },

        // Required for the Marionette demo
        'backbone.declarative.views': ['marionette']
    }
} );
