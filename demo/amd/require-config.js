requirejs.config( {

    // Base URL: project root
    baseUrl: '../../',

    paths: {
        'usertiming': 'demo/bower_demo_components/usertiming/src/usertiming',

        'jquery-legacy-v1': 'bower_components/jquery-legacy-v1/dist/jquery',
        'jquery-legacy-v2': 'bower_components/jquery-legacy-v2/dist/jquery',
        'jquery-modern': 'bower_components/jquery/dist/jquery',

        'underscore': 'bower_components/underscore/underscore',
        'backbone': 'bower_components/backbone/backbone',
        'backbone.radio': 'bower_components/backbone.radio/build/backbone.radio',
        'marionette-modern': 'bower_components/marionette/lib/backbone.marionette',
        'marionette-legacy': 'bower_components/marionette-legacy/lib/backbone.marionette',

        'backbone.declarative.views': 'dist/backbone.declarative.views',

        'local.base': 'demo/amd/base',
        'local.marionette': 'demo/amd/marionette',
        'local.plain': 'demo/amd/plain',
        'local.views-backbone': 'demo/amd/views-backbone',
        'local.views-marionette': 'demo/amd/views-marionette'
    },

    // Using a different jQuery here than elsewhere (1.x, instead of 3.x in node_modules and bower_components).
    // Makes the demo work in oldIE, too. Likewise for Marionette: using Marionette 2.x, rather than 3.x, for
    // legacy browsers.
    map: {
        '*': {
            'jquery': 'jquery-legacy-v1',
            'marionette': 'marionette-legacy'
        }
    },

    shim: {
        'jquery-legacy-v1': {
            exports: "jQuery"
        },
        'jquery-legacy-v2': {
            exports: "jQuery"
        },
        'jquery-modern': {
            exports: "jQuery"
        },

        // Required for the Marionette demo
        'backbone.declarative.views': ['marionette']
    }

} );
