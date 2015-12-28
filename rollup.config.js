import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/js-data-debug.js',
  sourceMap: 'dist/js-data-debug.js.map',
  format: 'umd',
  moduleName: 'JSData',
  plugins: [
    babel()
  ]
}
