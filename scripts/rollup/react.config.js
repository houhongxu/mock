// 打包React

import { getBaseRollupPlugins, getPkgJSON, resolvePkgPath } from './util'

// 获取react包的package.json的name包名属性和module入口属性
const { name, module } = getPkgJSON('react')
// 根据react包名获取包入口路径
const pkgPath = resolvePkgPath(name)
// 根据react包名获取产物路径
const pkgDistPath = resolvePkgPath(name, true)

export default [
  {
    input: `${pkgPath}/${module}`,
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'react',
      format: 'umd'
    },
    plugins: getBaseRollupPlugins()
  }
]
