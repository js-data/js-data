import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  moduleName: 'JSData',
  moduleId: 'js-data',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        'es2015-rollup'
      ],
      exclude: 'node_modules/**'
    })
  ]
}
