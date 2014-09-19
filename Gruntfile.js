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
            '* @version <%= pkg.version %> - Homepage <http://www.js-data.io/>\n' +
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
            'bower_components/js-data-http/dist/js-data-http.min.js',
            'bower_components/js-data-localstorage/dist/js-data-localstorage.min.js',
            'karma.start.js',
            'test/**/*.js'
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
    },
    docular: {
      groups: [
//        {
//          groupTitle: 'Guide',
//          groupId: 'guide',
//          groupIcon: 'icon-book',
//          sections: [
//            {
//              id: 'angular-data',
//              title: 'angular-data',
//              docs: [
//                'guide/angular-data/index.md',
//                'guide/angular-data/overview.md',
//                'guide/angular-data/resources.md',
//                'guide/angular-data/asynchronous.md',
//                'guide/angular-data/synchronous.md',
//                'guide/angular-data/queries.md',
//                'guide/angular-data/adapters.md',
//                'guide/angular-data/how.md'
//              ],
//              rank: {
//                index: 1,
//                overview: 2,
//                resources: 3,
//                asynchronous: 4,
//                synchronous: 5,
//                queries: 6,
//                adapters: 7,
//                how: 8
//              }
//            },
//            {
//              id: 'angular-cache',
//              title: 'angular-cache',
//              docs: ['guide/angular-cache/'],
//              rank: {
//                index: 1,
//                basics: 2,
//                configure: 3,
//                http: 4,
//                storage: 5
//              }
//            },
//            {
//              id: 'angular-data-mocks',
//              title: 'angular-data-mocks',
//              docs: ['guide/angular-data-mocks/'],
//              rank: {
//                index: 1,
//                overview: 2,
//                setup: 3,
//                testing: 4
//              }
//            },
//            {
//              id: 'angular-data-resource',
//              title: 'Defining Resources',
//              docs: ['guide/angular-data/resource/'],
//              rank: {
//                index: 1,
//                overview: 2,
//                basic: 3,
//                advanced: 4,
//                lifecycle: 5,
//                custom: 6,
//                relations: 7
//              }
//            }
//          ]
//        },
        {
          groupTitle: 'API',
          groupId: 'api',
          groupIcon: 'icon-wrench',
          showSource: true,
          sections: [
            {
              id: 'js-data',
              title: 'js-data',
              scripts: [
                'src/'
              ],
              docs: ['guide/api']
            }
          ]
        }
      ],
      docular_webapp_target: 'doc',
      showDocularDocs: false,
      showAngularDocs: false//,
//      docular_partial_home: 'guide/home.html',
//      docular_partial_navigation: 'guide/nav.html',
//      docular_partial_footer: 'guide/footer.html',
//      analytics: {
//        account: 'UA-34445126-2',
//        domainName: 'angular-data.pseudobry.com'
//      },
//      discussions: {
//        shortName: 'angulardata',
//        url: 'http://angular-data.pseudobry.com',
//        dev: dev
//      }
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
      '* @version ' + pkg.version + ' - Homepage <http://www.js-data.io/>\n' +
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
