({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.plain",
    exclude: [
        "usertiming",
        "jquery",
        "underscore",
        "backbone",
        "marionette",
        "backbone.declarative.views"
    ],
    out: "../../../jsbin/backbone-app.js"
})