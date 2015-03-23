/*
 * js-data
 * http://www.js-data.io
 *
 * Copyright (c) 2014-2015 Jason Dobry <http://www.js-data.io>
 * Licensed under the MIT license. <https://github.com/js-data/js-data/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls',
    instrument: 'grunt-istanbul',
    storeCoverage: 'grunt-istanbul',
    makeReport: 'grunt-istanbul'
  });
  require('time-grunt')(grunt);

  var webpack = require('webpack');
  var pkg = grunt.file.readJSON('package.json');
  var banner = 'js-data\n' +
    '@version ' + pkg.version + ' - Homepage <http://www.js-data.io/>\n' +
    '@author Jason Dobry <jason.dobry@gmail.com>\n' +
    '@copyright (c) 2014-2015 Jason Dobry \n' +
    '@license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
    '\n' +
    '@overview Robust framework-agnostic data store.';

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      coverage: ['coverage/'],
      dist: ['dist/']
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      },
      lite: {
        files: ['src/**/*.js'],
        tasks: ['webpack']
      },
      n: {
        files: ['src/**/*.js', 'test/both/**/*.js', 'test/node/**/*.js'],
        tasks: ['n']
      }
    },
    uglify: {
      main: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/js-data.min.map',
          banner: '/*!\n' +
          '* js-data\n' +
          '* @version <%= pkg.version %> - Homepage <http://www.js-data.io/>\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @copyright (c) 2014-2015 Jason Dobry\n' +
          '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
          '*\n' +
          '* @overview Robust framework-agnostic data store.\n' +
          '*/\n'
        },
        files: {
          'dist/js-data.min.js': ['dist/js-data.js']
        }
      }
    },
    webpack: {
      dist: {
        debug: true,
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-debug.js',
          libraryTarget: 'umd',
          library: 'JSData'
        },
        externals: {
          'js-data-schema': {
            amd: 'js-data-schema',
            commonjs: 'js-data-schema',
            commonjs2: 'js-data-schema',
            root: 'Schemator'
          },
          'bluebird': 'bluebird'
        },
        module: {
          loaders: [
            { test: /(src)(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader?blacklist=useStrict' }
          ],
          preLoaders: [
            {
              test: /(src)(.+)\.js$|(test)(.+)\.js$/, // include .js files
              exclude: /node_modules/, // exclude any and all files in the node_modules folder
              loader: "jshint-loader?failOnHint=true"
            }
          ]
        },
        plugins: [
          new webpack.BannerPlugin(banner)
        ]
      }
    },
    karma: {
      options: {
        configFile: './karma.conf.js'
      },
      dev: {
        browsers: ['Chrome'],
        autoWatch: true,
        autoWatchBatchDelay: 1000,
        singleRun: false,
        reporters: ['spec'],
        preprocessors: {}
      },
      min: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS'],
        options: {
          files: [
            'dist/js-data.min.js',
            'bower_components/js-data-schema/dist/js-data-schema.min.js',
            'bower_components/js-data-http/dist/js-data-http.min.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.min.js',
            'karma.start.js',
            'test/both/**/*.js',
            'test/browser/**/*.js'
          ]
        }
      },
      ci: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS']
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    },
    mochaTest: {
      all: {
        options: {
          reporter: 'spec'
        },
        src: ['mocha.start.js', 'test/both/**/*.js', 'test/node/**/*.js']
      }
    }
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    var parts = pkg.version.split('-');
    var numbers = parts[0].split('.');

    file = file.replace(/<%= major %>/gi, numbers[0]);
    file = file.replace(/<%= minor %>/gi, numbers[1]);
    file = file.replace(/<%= patch %>/gi, numbers[2]);

    if (pkg.version.indexOf('alpha') !== -1) {
      file = file.replace(/<%= alpha %>/gi, parts[1].replace('alpha.', '') + (parts.length > 2 ? '-' + parts[2] : ''));
    } else {
      file = file.replace(/<%= alpha %>/gi, false);
    }

    if (pkg.version.indexOf('beta') !== -1) {
      file = file.replace(/<%= beta %>/gi, parts[1].replace('beta.', '') + (parts.length > 2 ? '-' + parts[2] : ''));
    } else {
      file = file.replace(/<%= beta %>/gi, false);
    }

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('debug', function (filePath) {
    var file = grunt.file.read(filePath);

    var lines = file.split('\n');

    var newLines = [];

    lines.forEach(function (line) {
      if (line.indexOf('logFn(') === -1) {
        newLines.push(line);
      }
    });

    file = newLines.join('\n');

    file += '\n';

    grunt.file.write(filePath.replace('-debug', ''), file);
  });

  grunt.registerTask('n', ['mochaTest']);
  grunt.registerTask('b', ['karma:ci', 'karma:min']);
  grunt.registerTask('w', ['n', 'watch:n']);

  grunt.registerTask('test', ['build', 'n', 'b']);
  grunt.registerTask('build', [
    'clean',
    'webpack',
    'debug:dist/js-data-debug.js',
    'version:dist/js-data-debug.js',
    'version:dist/js-data.js',
    'uglify:main'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('golite', ['webpack', 'watch:lite']);
  grunt.registerTask('default', ['build']);
};
