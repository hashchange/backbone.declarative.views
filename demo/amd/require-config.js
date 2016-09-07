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

        'handlebars': 'demo/bower_demo_components/handlebars/handlebars',
        'marionette.handlebars': 'demo/bower_demo_components/marionette.handlebars/dist/marionette.handlebars',
        'backbone.declarative.views': 'dist/backbone.declarative.views',
        'precompiled.declarative.handlebars.templates': 'demo/bower_demo_components/precompiled.declarative.handlebars.templates/precompiled.declarative.handlebars.templates',

        'local.precompiled.templates': 'demo/amd/precompiled-templates/output/precompiled',

        'local.base': 'demo/amd/base',
        'local.marionette': 'demo/amd/marionette',
        'local.plain': 'demo/amd/plain',
        'local.plain-precompiled': 'demo/amd/plain-precompiled',
        'local.marionette-precompiled': 'demo/amd/marionette-precompiled',
        'local.views-backbone': 'demo/amd/views-backbone',
        'local.views-marionette': 'demo/amd/views-marionette'
    },

    map: {
        '*': {
            // Using a different jQuery here than elsewhere (1.x, instead of 3.x in node_modules and bower_components).
            // Makes the demo work in oldIE, too. Likewise for Marionette: using Marionette 2.x, rather than 3.x, for
            // legacy browsers.
            'jquery': 'jquery-legacy-v1',
            'marionette': 'marionette-legacy',

            // Templates precompiled with the --amd switch require 'handlebars.runtime' rather than 'handlebars'. As we
            // don't use the runtime here, we need to map 'handlebars' to a 'handlebars.runtime' alias.
            'handlebars.runtime': 'handlebars'
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
        'marionette': ['backbone.declarative.views']
    }

} );
