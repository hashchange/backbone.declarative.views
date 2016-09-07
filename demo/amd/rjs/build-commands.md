# Generating r.js builds

## Using a Grunt task

Instead of individual r.js calls, the following command will create all builds:

```
grunt requirejs
```

The grunt task simply reads the build profiles described below, and feeds them to r.js.


## Split builds with two build files, for JS Bin demos

The demo HTML files for JS Bin reference two concatenated build files (per page):

- `vendor.js` for the third-party dependencies. It includes Backbone.Declarative.Views.
- `backbone-app.js`, `marionette-app.js`, `backbone-precompiled-app.js` and `marionette-precompiled-app.js` for the demo code, consisting of local modules.

The code is not rolled up into a single file because that file would be massive, making it unnecessarily difficult to examine the demo code. The purpose of the demo is to see how Backbone.Declarative.Views is used, so it makes sense to keep the client code separate.

### Adjustments

Care must be taken to avoid duplication. A module pulled into `vendor.js` must not be part of `*-app.js`, and vice versa. Update the module exclusions in **all** build config files when new modules are added to a demo.

### r.js calls

Open a command prompt in the **project root** directory.

```
# For vendor.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/vendor-config.js

# For backbone-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/backbone-app-config.js

# For marionette-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/marionette-app-config.js

# For backbone-precompiled-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/backbone-precompiled-app-config.js

# For marionette-precompiled-app.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin-parts/marionette-precompiled-app-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/parts`.


## Single-file builds, for local demos

Builds for local demos are created to test that the setup continues to work after optimization with r.js. All modules of a demo end up in a single file. For easier examination, the file is not minified.

For more info, see the comments in `index.html`, `marionette.html`, `backbone-precompiled.html` and `marionette-precompiled.html`.

### r.js calls

For building the output file, open a command prompt in the **project root** directory, and run these commands:

```
# For the vanilla JS demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/plain-build-config.js

# For the Marionette demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/marionette-build-config.js

# For the vanilla JS demo with precompiled templates:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/plain-precompiled-build-config.js

# For the Marionette demo with precompiled templates:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/unified/marionette-precompiled-build-config.js
```

### Output files

The output is written to the directory `demo/amd/rjs/output/unified`.