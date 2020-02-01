import typescript from 'rollup-plugin-typescript2'

export default commandLineArgs => ({
  output: {
    amd: {
      id: 'js-data'
    },
    name: 'JSData'
  },
  plugins: [typescript({
    tsconfigOverride: {
      compilerOptions: {
        module: 'es2015',
        target: commandLineArgs.format === 'umd' ? 'es5' : 'es2015',
        declaration: commandLineArgs.format === 'umd'
      },
      include: ['src'],
      exclude: ['node_modules', 'test', 'scripts', './rollup.config.js']
    }
  })]
})
