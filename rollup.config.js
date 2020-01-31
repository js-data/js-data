import typescript from '@rollup/plugin-typescript'

export default commandLineArgs => ({
  output: {
    amd: {
      id: 'js-data'
    },
    name: 'JSData'
  },
  plugins: [typescript({
    tsconfig: './tsconfig.json',
    target: commandLineArgs.format === 'umd' ? 'es5' : 'es2015'
  })]
})
