({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.plain",
    exclude: [
        "usertiming",
        "jquery",
        "underscore",
        "backbone",
        "backbone.radio",
        "marionette",
        "handlebars",
        "marionette.handlebars",
        "backbone.declarative.views",
        "precompiled.declarative.handlebars.templates"
    ],
    out: "../../output/parts/backbone-app.js"
})