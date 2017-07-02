import babel from 'rollup-plugin-babel'

export default {
  moduleName: 'JSData',
  amd: {
    id: 'js-data'
  },
  plugins: [
    babel({
      babelrc: false,
      plugins: [
        'external-helpers'
      ],
      presets: [
        [
          'es2015',
          {
            modules: false
          }
        ]
      ],
      exclude: 'node_modules/**'
    })
  ]
}
