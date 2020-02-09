import typescript from 'rollup-plugin-typescript2'
import babel from 'rollup-plugin-babel'

export default commandLineArgs => {
  const isUmd = commandLineArgs.format === 'umd'
  return {
    output: {
      amd: {
        id: 'js-data'
      },
      name: 'JSData'
    },
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            module: 'es2015',
            declaration: isUmd
          },
          include: ['src'],
          exclude: ['node_modules', 'test', 'scripts', './rollup.config.js']
        }
      }),
      isUmd && babel({ extensions: ['.ts'] })
    ]
  }
}
