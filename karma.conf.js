var customLaunchers = {
	bs_ie9_windows7: {
		base: 'BrowserStack',
		browser: 'ie',
		browser_version: '9.0',
		os: 'Windows',
		os_version: '7'
	}
};

var browsers = ['PhantomJS'];
if (
	process.env.BROWSERSTACK_USERNAME &&
	process.env.BROWSERSTACK_ACCESS_KEY
) {
	browsers = browsers.concat(Object.keys(customLaunchers));
}

module.exports = function(config) {
	config.set({
		// base path, that will be used to resolve files and exclude
		basePath: './',
		frameworks: ['sinon', 'chai', 'mocha'],
		plugins: [
			// these plugins will be require() by Karma
			'karma-sinon',
			'karma-mocha',
			'karma-chai',
			'karma-chrome-launcher',
			'karma-phantomjs-launcher',
			'karma-firefox-launcher',
			'karma-coverage',
			'karma-browserstack-launcher',
			'karma-junit-reporter'
		],
		autoWatch: false,
		autoWatchBatchDelay: 4000,
		browsers: browsers,

		// list of files / patterns to load in the browser
		files: [
			'node_modules/es6-promise/dist/es6-promise.js',
			'dist/js-data.js',
			'bower_components/js-data-http/dist/js-data-http.js',
			'bower_components/js-data-localstorage/dist/js-data-localstorage.js',
			'karma.start.js',
			'test/both/**/*.test.js',
			'test/browser/**/*.test.js'
		],

		reporters: ['dots', 'coverage', 'junit'],

		preprocessors: {
			'dist/js-data-debug.js': ['coverage']
		},

		// optionally, configure the reporter
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/'
		},

    // the default configuration
    junitReporter: {
      outputDir: process.env.CIRCLE_TEST_REPORTS || 'junit',
      outputFile: undefined,
      suite: 'js-data',
      useBrowserName: false
    },

		browserStack: {
			username: process.env.BROWSERSTACK_USERNAME,
			accessKey: process.env.BROWSERSTACK_ACCESS_KEY
		},

		customLaunchers: customLaunchers,

		browserNoActivityTimeout: 30000,

		// web server port
		port: 9876,

		// cli runner port
		runnerPort: 9100,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		logLevel: config.LOG_INFO,

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 30000,

		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};