import babel from 'rollup-plugin-babel'

export default {
  moduleName: 'JSData',
  moduleId: 'js-data',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'es2015', { 'modules': false }
        ]
      ],
      plugins: ['external-helpers'],
      exclude: 'node_modules/**'
    })
  ]
}
