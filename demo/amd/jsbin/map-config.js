requirejs.config( {

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    // Keep this in sync with the map config in amd/require-config.js
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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
    }

} );
