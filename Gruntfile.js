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

  var pkg = grunt.file.readJSON('package.json');

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
      dist: require('./webpack.config.js')
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
      minChrome: {
        browsers: ['Chrome'],
        options: {
          files: [
            'node_modules/es6-promise/dist/es6-promise.js',
            'dist/js-data.min.js',
            'bower_components/js-data-http/dist/js-data-http.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.js',
            'karma.start.js',
            'test/both/**/*.js',
            'test/browser/**/*.js'
          ]
        }
      },
      minFirefox: {
        browsers: ['Firefox'],
        options: {
          files: [
            'node_modules/es6-promise/dist/es6-promise.js',
            'dist/js-data.min.js',
            'bower_components/js-data-http/dist/js-data-http.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.js',
            'karma.start.js',
            'test/both/**/*.js',
            'test/browser/**/*.js'
          ]
        }
      },
      minPhantomJS: {
        browsers: ['PhantomJS'],
        options: {
          files: [
            'node_modules/es6-promise/dist/es6-promise.js',
            'dist/js-data.min.js',
            'bower_components/js-data-http/dist/js-data-http.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.js',
            'karma.start.js',
            'test/both/**/*.js',
            'test/browser/**/*.js'
          ]
        }
      },
      ci: {
        browsers: ['Chrome', 'Firefox', 'PhantomJS']
      },
      ci_c9: {
        browsers: ['PhantomJS']
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

  grunt.registerTask('gzip', function () {
    var child_process = require('child_process');
    var done = this.async();
    grunt.log.writeln('Measuring gzip size...');
    child_process.exec('cat dist/js-data.min.js | gzip -f9 | wc -c', function (err, stdout) {
      grunt.log.writeln('File dist/js-data.min.js gzipped: ' + stdout.replace('\n', ' kB'));
      done();
    });
  });

  grunt.registerTask('standard', function () {
    var child_process = require('child_process');
    var done = this.async();
    grunt.log.writeln('Linting for correcting formatting...');
    child_process.exec('node node_modules/standard/bin/cmd.js --parser babel-eslint src/*.js src/**/*.js src/**/**/*.js', function (err, stdout) {
      console.log(stdout);
      if (err) {
        grunt.log.writeln('Failed due to ' + (stdout.split('\n').length - 2) + ' lint errors!');
        done(err);
      } else {
        grunt.log.writeln('Done linting.');
        done();
      }
    });
  });

  grunt.registerTask('n', ['mochaTest']);
  grunt.registerTask('b', ['karma:ci', 'karma:minChrome', 'karma:minFirefox', 'karma:minPhantomJS']);
  grunt.registerTask('w', ['n', 'watch:n']);

  grunt.registerTask('test', ['build', 'n', 'b']);
  grunt.registerTask('test_c9', ['build', 'n', 'karma:ci_c9', 'karma:minPhantomJS']);
  grunt.registerTask('build', [
    'clean',
    'standard',
    'webpack',
    'debug:dist/js-data-debug.js',
    'version:dist/js-data-debug.js',
    'version:dist/js-data.js',
    'uglify:main',
    'gzip'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('golite', ['webpack', 'watch:lite']);
  grunt.registerTask('default', ['build']);
};
