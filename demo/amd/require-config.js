requirejs.config( {

    baseUrl: '../../bower_components',

    paths: {
        'usertiming': '../demo/bower_demo_components/usertiming/src/usertiming',

        // Using a different jQuery here than elsewhere (1.x, instead of 2.x in node_modules).
        // Makes the demo work in oldIE, too.
        'jquery': '../demo/bower_demo_components/jquery/dist/jquery',

        // Use this path for switching to jQuery 2.x
        // 'jquery': 'jquery/dist/jquery',

        'underscore': 'underscore/underscore',
        'backbone': 'backbone/backbone',

        'marionette': 'marionette/lib/backbone.marionette',
        'handlebars': '../demo/bower_demo_components/handlebars/handlebars',
        'marionette.handlebars': '../demo/bower_demo_components/marionette.handlebars/index',

        'backbone.declarative.views': '/dist/amd/backbone.declarative.views',
        'marionette.declarativeviews.integration': '/dist/extras/amd/marionette.declarativeviews.integration',

        'local.base': '../demo/amd/base'
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
        'handlebars': {
            exports: 'Handlebars'
        },
        'marionette.handlebars': {
            deps: ['handlebars', 'backbone', 'marionette'],
            exports: 'MarionetteHandlebars'
        }
    }
} );
