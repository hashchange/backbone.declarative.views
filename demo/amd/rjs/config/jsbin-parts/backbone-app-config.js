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
    out: "../../output/parts/backbone-app.js"
})