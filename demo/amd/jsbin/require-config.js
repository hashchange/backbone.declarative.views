requirejs.config( {

    paths: {
        'usertiming': 'https://cdn.rawgit.com/nicjansma/usertiming.js/v0.1.6/src/usertiming',

        'jquery': 'https://code.jquery.com/jquery-1.11.3',

        'underscore': 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore',
        'backbone': 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/backbone',
        'marionette': 'https://cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.2/backbone.marionette',

        'backbone.declarative.views': 'https://cdn.rawgit.com/hashchange/backbone.declarative.views/2.0.2/dist/amd/backbone.declarative.views',

        'local.base': 'https://cdn.rawgit.com/hashchange/backbone.declarative.views/2.1.0/demo/amd/base',
        'local.views-backbone': 'https://cdn.rawgit.com/hashchange/backbone.declarative.views/2.1.0/demo/amd/views-backbone',
        'local.views-marionette': 'https://cdn.rawgit.com/hashchange/backbone.declarative.views/2.1.0/demo/amd/views-marionette'
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
        }
    }
} );

