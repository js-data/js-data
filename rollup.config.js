import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/js-data.js',
  sourceMap: 'dist/js-data.js.map',
  format: 'umd',
  moduleName: 'JSData',
  plugins: [
    babel()
  ]
}
