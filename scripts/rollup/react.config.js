// 打包React

import generatePackageJson from 'rollup-plugin-generate-package-json'
import { getBaseRollupPlugins, getPkgJSON, resolvePkgPath } from './util'

// 获取包的package.json的name包名属性和module入口属性
const { name, module } = getPkgJSON('react')
// 根据包名获取包入口路径
const pkgPath = resolvePkgPath(name)
// 根据包名获取产物路径
const pkgDistPath = resolvePkgPath(name, true)

const basePlugins = getBaseRollupPlugins()

export default [
  // react
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'React',
      format: 'umd'
    },
    plugins: [
      ...basePlugins,
      // 自定义生成打包产物的package.json
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          main: 'index.js' // 由umd支持
        })
      })
    ]
  },
  {
    input: `${pkgPath}/src/jsx.ts`,
    output: [
      // jsx-runtime
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'jsxRuntime',
        format: 'umd'
      },
      // jsx-dev-runtime
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsxDevRuntime',
        format: 'umd'
      }
    ],
    plugins: basePlugins
  }
]
