/*global module:false*/
module.exports = function(grunt) {

  var LIVERELOAD_PORT = 35731,
      HTTP_PORT = 9400,
      KARMA_PORT = 9877,
      WATCHED_FILES = [
        'demo/**/*',
        'spec/**/*',
        'src/**/*'
      ],
      SINON_SOURCE_DIR = 'node_modules/karma-chai-plugins/node_modules/sinon/lib/sinon/';

  // Project configuration.
  grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      banner: '// Backbone.Declarative.Views, v<%= meta.version %>\n' +
        '// Copyright (c)<%= grunt.template.today("yyyy") %> Michael Heim, Zeilenwechsel.de\n' +
        '// Distributed under MIT license\n' +
        '// http://github.com/hashchange/backbone.declarative.views\n' +
        '\n'
    },

    preprocess: {
      // Currently works as a copy
      build: {
        files: {
          'dist/backbone.declarative.views.js' : 'src/backbone.declarative.views.js',
          'dist/amd/backbone.declarative.views.js' : 'src/amd.js'
        }
      },
      interactive: {
        files: {
          'web-mocha/index.html': 'web-mocha/_index.html'
        }
      }
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        src: 'dist/backbone.declarative.views.js',
        dest: 'dist/backbone.declarative.views.js'
      },
      amd_banner: {
        src: 'dist/amd/backbone.declarative.views.js',
        dest: 'dist/amd/backbone.declarative.views.js'
      }
    },

    uglify: {
      options: {
        banner: "<%= meta.banner %>",
        mangle: {
          except: ['jQuery', 'Backbone', '_']
        },
        sourceMap: true
      },
      amd: {
        src : 'dist/amd/backbone.declarative.views.js',
        dest : 'dist/amd/backbone.declarative.views.min.js'
      },
      core: {
        src: 'dist/backbone.declarative.views.js',
        dest: 'dist/backbone.declarative.views.min.js'
      }
    },

    karma: {
      options: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS'],
        port: KARMA_PORT
      },
      test: {
        reporters: ['mocha'],
        singleRun: true
      },
      build: {
        reporters: ['progress'],
        singleRun: true
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      component: 'src/backbone.declarative.views.js'
    },

    plato: {
      component: {
        src: 'src/*.js',
        dest: 'reports',
        options: {
          jshint: grunt.file.readJSON('.jshintrc')
        }
      }
    },

    'sails-linker': {
      options: {
        startTag: '<!--SCRIPTS-->',
        endTag: '<!--SCRIPTS END-->',
        fileTmpl: '<script src="../%s"></script>',
        // relative doesn't seem to have any effect, ever
        relative: true,
        // appRoot is a misnomer for "strip out this prefix from the file path before inserting",
        // should be stripPrefix
        appRoot: ''
      },
      interactive_spec: {
        options: {
          startTag: '<!--SPEC SCRIPTS-->',
          endTag: '<!--SPEC SCRIPTS END-->'
        },
        files: {
          // the target file is changed in place; for generating copies, run preprocess first
          'web-mocha/index.html': ['spec/**/*.+(spec|test|tests).js']
        }
      },
      interactive_sinon: {
        options: {
          startTag: '<!--SINON COMPONENT SCRIPTS-->',
          endTag: '<!--SINON COMPONENT SCRIPTS END-->'
        },
        files: {
          // the target file is changed in place; for generating copies, run preprocess first
          //
          // mock.js must be loaded last (specifically, after spy.js). For the pattern achieving it, see
          // http://gruntjs.com/configuring-tasks#globbing-patterns
          'web-mocha/index.html': [
            SINON_SOURCE_DIR + '**/*.js',
            '!' + SINON_SOURCE_DIR + 'mock.js',
            SINON_SOURCE_DIR + 'mock.js'
          ]
        }
      }
    },

    watch: {
      options: {
        nospawn: false
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: WATCHED_FILES
      },
      build: {
        tasks: ['default'],
        files: WATCHED_FILES
      }
    },

    connect: {
      options: {
        port: HTTP_PORT,
        // change this to '*' to access the server from outside
        hostname: 'localhost',
        open: true,
        base: '.'
      },
      livereload: {
        livereload: LIVERELOAD_PORT
      },
      test: {
        options: {
          open: 'http://localhost:<%= connect.options.port %>/web-mocha/',
          livereload: LIVERELOAD_PORT
        }
      },
      demo: {
        options: {
          open: 'http://localhost:<%= connect.options.port %>/demo/',
          livereload: LIVERELOAD_PORT
        }
      }
    },

    replace: {
     version: {
        src: ['bower.json', 'package.json'],
        overwrite: true,
        replacements: [{
          from: /"version"\s*:\s*"((\d+\.\d+\.)(\d+))"\s*,/,
          to: function (matchedWord, index, fullText, regexMatches) {
            var version = grunt.option('inc') ? regexMatches[1] + (parseInt(regexMatches[2], 10) + 1) : grunt.option('to');

            if (version === undefined) grunt.fail.fatal('Version number not specified. Use the --to option, e.g. --to=1.2.3, or the --inc option to increment the revision');
            if (typeof version !== "string") grunt.fail.fatal('Version number is not a string. Provide a semantic version number, e.g. --to=1.2.3');
            if (!/^\d+\.\d+.\d+$/.test(version)) grunt.fail.fatal('Version number is not semantic. Provide a version number in the format n.n.n, e.g. --to=1.2.3');

            grunt.log.writeln('Modifying file: Changing the version number from ' + regexMatches[0] + ' to ' + version);
            return '"version": "' + version + '",';
          }
        }]
      }
    },
    getver: {
      files: ['bower.json', 'package.json']
    }
  });

  grunt.loadNpmTasks('grunt-plato');
  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-sails-linker');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('test', ['jshint', 'karma:test']);
  grunt.registerTask('interactive', ['preprocess:interactive', 'sails-linker:interactive_sinon', 'sails-linker:interactive_spec', 'connect:test', 'watch:livereload']);
  grunt.registerTask('demo', ['connect:demo', 'watch:livereload']);
  grunt.registerTask('build', ['jshint', 'karma:build', 'preprocess:build', 'concat', 'uglify']);
  grunt.registerTask('ci', ['watch:build']);
  grunt.registerTask('setver', ['replace:version']);
  grunt.registerTask('getver', function () {
    grunt.config.get('getver.files').forEach(function (file) {
    var config = grunt.file.readJSON(file);
    grunt.log.writeln('Version number in ' + file + ': ' + config.version);
    });
  });

  // Make 'build' the default task.
  grunt.registerTask('default', ['build']);


};