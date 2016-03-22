import babel from 'rollup-plugin-babel'

export default {
  entry: '.tmp/src/index.js',
  dest: 'dist/js-data.js',
  sourceMap: 'dist/js-data.js.map',
  format: 'umd',
  moduleName: 'JSData',
  moduleId: 'js-data',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
