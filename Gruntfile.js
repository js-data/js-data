/*
 * js-data
 * http://github.com/jmdobry/js-data
 *
 * Copyright (c) 2014 Jason Dobry <http://jmdobry.github.io/js-data>
 * Licensed under the MIT license. <https://github.com/jmdobry/js-data/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  'use strict';

  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls'
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
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'test/*.js'],
      jshintrc: '.jshintrc'
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    },
    uglify: {
      main: {
        options: {
          banner: '/**\n' +
            '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
            '* @file js-data.min.js\n' +
            '* @version <%= pkg.version %> - Homepage <http://js-data.io/>\n' +
            '* @copyright (c) 2014 Jason Dobry\n' +
            '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
            '*\n' +
            '* @overview Data store.\n' +
            '*/\n'
        },
        files: {
          'dist/js-data.min.js': ['dist/js-data.js']
        }
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          standalone: 'JSData'
        }
      },
      dist: {
        files: {
          'dist/js-data.js': ['src/index.js']
        }
      }
    },
    karma: {
      options: {
        configFile: './karma.conf.js'
      },
      dev: {
        browsers: ['Chrome'],
        autoWatch: true,
        singleRun: false,
        reporters: ['spec'],
        preprocessors: {}
      },
      min: {
        browsers: ['Firefox', 'PhantomJS'],
        options: {
          files: [
            'dist/js-data.min.js',
            'karma.start.js',
            'test/integration/**/*.js'
          ]
        }
      },
      ci: {
        browsers: ['Firefox', 'PhantomJS']
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    }
  });

  grunt.registerTask('version', function (filePath) {
    var file = grunt.file.read(filePath);

    file = file.replace(/<%= pkg\.version %>/gi, pkg.version);

    grunt.file.write(filePath, file);
  });

  grunt.registerTask('banner', function () {
    var file = grunt.file.read('dist/js-data.js');

    var banner = '/**\n' +
      '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
      '* @file js-data.js\n' +
      '* @version ' + pkg.version + ' - Homepage <http://js-data.io/>\n' +
      '* @copyright (c) 2014 Jason Dobry \n' +
      '* @license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
      '*\n' +
      '* @overview Data store.\n' +
      '*/\n';

    file = banner + file;

    grunt.file.write('dist/js-data.js', file);
  });

  grunt.registerTask('test', ['build', 'karma:ci', 'karma:min']);
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'browserify',
    'banner',
    'uglify:main'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
};
