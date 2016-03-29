import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  moduleName: 'JSData',
  moduleId: 'js-data',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
