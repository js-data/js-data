import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  dest: 'dist/js-data.es2015.js',
  sourceMap: 'dist/js-data.es2015.js.map',
  format: 'es6',
  moduleName: 'JSData',
  moduleId: 'js-data',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
