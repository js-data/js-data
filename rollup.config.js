import typescript from '@rollup/plugin-typescript'

export default commandLineArgs => ({
  output: {
    amd: {
      id: 'js-data'
    },
    name: 'JSData'
  },
  plugins: [typescript({
    module: 'es2015',
    target: commandLineArgs.format === 'umd' ? 'es5' : 'es2015'
  })]
})
