({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.marionette",
    exclude: [
        "usertiming",
        "jquery",
        "underscore",
        "backbone",
        "marionette",
        "backbone.declarative.views"
    ],
    out: "../../../jsbin/marionette-app.js"
})