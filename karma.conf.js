// an example karma.conf.js
module.exports = function (config) {
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
			'karma-spec-reporter'
		],
		autoWatch: false,
		autoWatchBatchDelay: 4000,
		browsers: ['Chrome'],

		// list of files / patterns to load in the browser
		files: [
			'dist/js-data-debug.js',
			'bower_components/js-data-http/dist/js-data-http.js',
			'bower_components/js-data-schema/dist/js-data-schema.js',
			'bower_components/js-data-localstorage/dist/js-data-localstorage.js',
			'karma.start.js',
			'test/both/**/*.test.js',
			'test/browser/**/*.test.js'
		],

		reporters: ['spec', 'coverage'],

		preprocessors: {
			'dist/js-data-debug.js': ['coverage']
		},

		// optionally, configure the reporter
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/'
		},

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
