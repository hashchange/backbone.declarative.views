({
    mainConfigFile: "../../../require-config.js",
    optimize: "none",
    name: "local.plain",
    include: ["local.marionette"],
    excludeShallow: [
        "local.base",
        "local.marionette",
        "local.plain",
        "local.views-backbone",
        "local.views-marionette"
    ],
    out: "../../../jsbin/vendor.js"
})