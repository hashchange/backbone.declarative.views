// Karma configuration
// Generated on Mon Dec 30 2013 16:14:03 GMT+0100 (CET)

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// + For automated testing with Grunt, some settings in this config file  +
// + are overridden in Gruntfile.js. Check both locations.                +
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    //
    // Available for chai (installed with karma-chai-plugins):
    // sinon-chai, chai-as-promised, chai-jquery. Enable as needed.
    //
    // NB sinon-chai includes Sinon; chai-jquery does _not_ include jQuery
    frameworks: ['mocha', 'chai', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      // Component dependencies

      // Using the latest jQuery by default. Switch to jQuery 1.x or 2.x as needed.
      //  
      // NB Tests run through the interactive web interface use jQuery 1.x. Use `grunt interactive` or `grunt webtest` 
      // for them.

      'bower_components/jquery/dist/jquery.js',
      // 'bower_components/jquery-legacy-v1/dist/jquery.js',
      // 'bower_components/jquery-legacy-v2/dist/jquery.js',
        
      'bower_components/underscore/underscore.js',
      'bower_components/backbone/backbone.js',

      // Component under test (main)
      'src/backbone.declarative.views.js',

      // Marionette (must be loaded after Backbone.Declarative.Views)
      'bower_components/marionette-legacy/lib/backbone.marionette.js',
      // 'bower_components/backbone.radio/build/backbone.radio.js',
      // 'bower_components/marionette/lib/backbone.marionette.js',

      // Test helpers
      'node_modules/chai-subset/lib/chai-subset.js',
      'spec/chai-helpers/**/*.js',
      'spec/helpers/**/*.js',

      // Tests
      'spec/**/*.+(spec|test|tests).js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage', 'mocha'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari
    // - PhantomJS
    // - SlimerJS
    // - IE (Windows only)
    //
    // ATTN Interactive debugging in PhpStorm/WebStorm doesn't work with PhantomJS. Use Firefox or Chrome instead.
    browsers: ['PhantomJS'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
