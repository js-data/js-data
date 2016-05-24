var browsers = ['PhantomJS']

var customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 10',
    version: 'latest'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 10',
    version: 'latest'
  },
  sl_safari_9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  sl_ios_9: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '9.1'
  },
  sl_edge: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: 'latest'
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  sl_ie_9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2008',
    version: '9'
  },
  sl_android_5: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1'
  }
}

if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  browsers = browsers.concat(Object.keys(customLaunchers))
}

module.exports = function (config) {
  config.set({
    basePath: './',
    frameworks: [
      'chai',
      'mocha',
      'sinon'
    ],
    plugins: [
      'karma-babel-preprocessor',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-sauce-launcher',
      'karma-sinon'
    ],
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/utils.js',
      'src/Relation.js',
      'src/Relation/*.js',
      'src/decorators.js',
      'src/Component.js',
      'src/Schema.js',
      'src/Query.js',
      'src/Record.js',
      'src/Mapper.js',
      'lib/mindex/_utils.js',
      'lib/mindex/index.js',
      'src/Collection.js',
      'src/Container.js',
      'src/LinkedCollection.js',
      'src/DataStore.js',
      'src/index.js',
      'test/_setup.js',
      'test/unit/schema/_productSchema.js',
      'test/**/*.js'
    ],
    preprocessors: {
      'src/**/*.js': ['babel'],
      'lib/**/*.js': ['babel'],
      'test/**/*.js': ['babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        plugins: [
          'syntax-async-functions',
          'transform-regenerator',
          'transform-es2015-modules-umd'
        ],
        sourceMap: 'inline'
      }
    },
    client: {
      mocha: {
        // grep: 'utils.'
      }
    },
    browsers: browsers,
    reporters: ['progress', 'saucelabs'],
    sauceLabs: {
      testName: 'JSData Tests',
      public: 'public',
      recordVideo: false,
      recordScreenshots: false,
      build: process.env.CIRCLE_BUILD_NUM ? ('circle-' + process.env.CIRCLE_BUILD_NUM) : ('local-' + new Date().getTime())
    },
    customLaunchers: customLaunchers,
    port: 9876,
    browserDisconnectTimeout: 10000,
    browserNoActivityTimeout: 30000,
    captureTimeout: 120000,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  })
}
