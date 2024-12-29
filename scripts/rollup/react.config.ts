import { getBaseRollupPlugins, getPkgJson, resolvePkgPath } from './utils'
import { RollupOptions } from 'rollup'
import generatePackageJson from 'rollup-plugin-generate-package-json'

const { name, module } = getPkgJson('react')

const pkgPath = resolvePkgPath(name)

const pkgDistPath = resolvePkgPath(name, true)

const rollupOptionsArr: RollupOptions[] = [
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'React',
      format: 'umd',
    },
    plugins: [getBaseRollupPlugins()],
  },

  {
    input: `${pkgPath}/jsx-dev-runtime.ts`,
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'jsxRuntime.js',
        format: 'umd',
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsxDevRuntime.js',
        format: 'umd',
      },
    ],
    plugins: [
      getBaseRollupPlugins(),
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: 'index.js',
        }),
      }),
    ],
  },
]

console.log('rollupOptionsArr', rollupOptionsArr)

export default rollupOptionsArr
