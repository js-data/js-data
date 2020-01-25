import babel from 'rollup-plugin-babel'

export default {
  output: {
    amd: {
      id: 'js-data'
    },
    name: 'JSData'
  },
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          '@babel/preset-env',
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
