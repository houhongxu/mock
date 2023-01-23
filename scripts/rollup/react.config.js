// 打包React

import generatePackageJson from 'rollup-plugin-generate-package-json'
import { getBaseRollupPlugins, getPkgJSON, resolvePkgPath } from './util'
// 获取react包的package.json的name包名属性和module入口属性
const { name, module } = getPkgJSON('react')
// 根据react包名获取包入口路径
const pkgPath = resolvePkgPath(name)
// 根据react包名获取产物路径
const pkgDistPath = resolvePkgPath(name, true)

const basePlugins = getBaseRollupPlugins()

export default [
  // react
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'react',
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
        name: 'jsx-runtime',
        format: 'umd'
      },
      // jsx-dev-runtime
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsx-dev-runtime',
        format: 'umd'
      }
    ],
    plugins: basePlugins
  }
]
