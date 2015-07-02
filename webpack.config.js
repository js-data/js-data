var webpack = require('webpack');
var pkg = JSON.parse(require('fs').readFileSync('package.json'));
var banner = 'js-data\n' +
  '@version ' + pkg.version + ' - Homepage <http://www.js-data.io/>\n' +
  '@author Jason Dobry <jason.dobry@gmail.com>\n' +
  '@copyright (c) 2014-2015 Jason Dobry \n' +
  '@license MIT <https://github.com/js-data/js-data/blob/master/LICENSE>\n' +
  '\n' +
  '@overview Robust framework-agnostic data store.';

module.exports = {
  debug: true,
  entry: './src/index.js',
  output: {
    filename: './dist/js-data-debug.js',
    libraryTarget: 'umd',
    library: 'JSData'
  },
  module: {
    loaders: [
      { test: /(src)(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader?blacklist=useStrict&modules=commonStrict' }
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
};
