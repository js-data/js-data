import babel from 'rollup-plugin-babel'

export default {
  moduleName: 'JSData',
  amd: {
    id: 'js-data'
  },
  plugins: [
    babel({
      babelrc: false,
      plugins: ['external-helpers'],
      presets: [
        [
          'env',
          {
            modules: false,
            targets: {
              browsers: ['last 2 versions', 'safari >= 7', '> 1%', 'IE 11']
            }
          }
        ]
      ],
      exclude: 'node_modules/**'
    })
  ]
}
