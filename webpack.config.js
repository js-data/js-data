var path= require('path')

module.exports = {
  devtool: 'source-map',
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
          path.resolve(__dirname, 'lib'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'test')
        ],
        test: /\.jsx?$/,
        query: {
          presets: ['es2015', 'stage-1']
        }
      }
    ]
  },
  plugins: [
    {
      apply: function (compiler) {

        function isObject (value) {
          return toString.call(value) === '[object Object]' || false
        }

        function findAndReplace (target) {
          if (Array.isArray(target)) {
            target.forEach(findAndReplace)
          } else if (isObject(target)) {
            for (var key in target) {
              if (target.hasOwnProperty(key)) {
                if (typeof target[key] === 'string') {
                  target[key] = target[key]
                    .replace(/__callCheck__/gi, '_classCallCheck')
                    .replace(/__inherits__/gi, '_inherits');
                } else if (Array.isArray(target[key])) {
                  target[key].forEach(findAndReplace);
                } else if (target[key] && isObject(target[key])) {
                  findAndReplace(target[key]);
                }
              }
            }
          }
        }

        compiler.plugin('compilation', function (compilation) {
          compilation.plugin('optimize-chunk-assets', function (chunks, cb) {
            chunks.forEach(function (chunk) {
              if (chunk.initial) {
                chunk.files.forEach(function (file) {
                  if (file === './dist/js-data-debug.js') {
                    var start = new Date().getTime();
                    findAndReplace(compilation.assets[file]._source.children[0].children);
                    var end = new Date().getTime();
                    console.log('time taken: ' + (end - start) + 'ms');
                  }
                });
              }
            });
            cb();
          });
        });
      }
    }
  ]
}
