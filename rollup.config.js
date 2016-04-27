import babel from 'rollup-plugin-babel'

export default {
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
