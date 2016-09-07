({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.plain",
    include: ["local.marionette", "local.plain-precompiled", "local.marionette-precompiled"],
    excludeShallow: [
        "local.precompiled.templates",
        "local.base",
        "local.marionette",
        "local.plain",
        "local.plain-precompiled",
        "local.marionette-precompiled",
        "local.views-backbone",
        "local.views-marionette"
    ],
    out: "../../output/parts/vendor.js"
})