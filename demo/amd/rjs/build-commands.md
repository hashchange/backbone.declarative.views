# Generating r.js builds

## Generating builds for JS Bin demos

### Two build files

The demo HTML files reference two concatenated build files:

- `vendor.js` for the third-party dependencies. It includes Backbone.Declarative.Views and a local wrapper model (`backbone.declarative.views.marionette`) which is needed to set up a Marionette dependency for it.
- `backbone-app.js` and `marionette-app.js` for the demo code, consisting of local modules (except for the Backbone.Declarative.Views wrapper).

The code is not rolled up into a single file because that file would be massive, making it unnecessarily difficult to examine the demo code. The purpose of the demo is to see how Backbone.Declarative.Views is used, so it makes sense to keep the client code separate.

### Adjustments

Care must be taken to avoid duplication. A module pulled into `vendor.js` must not be part of `*-app.js`, and vice versa. Update the module exclusions **all** build config files when new modules are added to a demo.

### r.js calls

Open a command prompt in the **project root** directory.

```
# For vendor.js:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin/vendor-config.js

# For *-app.js

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin/backbone-app-config.js
node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/jsbin/marionette-app-config.js
```

### Output files

The output is written to the `demo/amd/jsbin` directory.


## Generating builds for local demos

Builds for local demos are created to test that the setup continues to work after optimization with r.js. All modules of a demo end up in a single file. For easier examination, the file is not minified.

For more info, see the comments in `index.html` and `marionette.html`.

### r.js calls

For building the output file, open a command prompt in the **project root** directory, and run these commands:

```
# For the vanilla JS demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/local/plain-build-config.js

# For the Marionette demo:

node node_modules/requirejs/bin/r.js -o demo/amd/rjs/config/local/marionette-build-config.js
```

### Output files

The output is written to the `demo/amd/rjs/output-local` directory.