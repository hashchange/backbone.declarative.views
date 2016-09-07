# Precompiling Handlebars templates

All templates in the /source directory are precompiled and concatenated into a single file, to be loaded with AMD, with the following command:

```
handlebars --amd source/ > output/precompiled.js
```

The ID of a given template, when pulled from the store of precompiled templates, is the same as the filename of the source template, minus the `.handlebars` extension.

For more on the numerous gotchas when precompiling Handlebars templates, see the Marionette.Handlebars project. The full lowdown can be found there, in `demo/amd/require-config.js`.