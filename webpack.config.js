var path= require('path')

module.exports = {
  debug: true,
  entry: {
    './dist/js-data-debug.js': './src/index.js',
    './dist/js-data-tests.js': './test/unit/index.js'
  },
  output: {
    filename: '[name]',
    libraryTarget: 'umd',
    library: 'JSData'
  },
  module: {
    loaders: [
      {
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        test: /\.jsx?$/,
        query: {
          presets: ['es2015', 'stage-1']
        }
      }
    ]
  }
}
