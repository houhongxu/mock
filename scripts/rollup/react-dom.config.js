// 打包ReactDOM

import generatePackageJson from 'rollup-plugin-generate-package-json'
import { getBaseRollupPlugins, getPkgJSON, resolvePkgPath } from './util'
import aias from '@rollup/plugin-alias'

// 获取包的package.json的name包名属性和module入口属性
const { name, module, peerDependencies } = getPkgJSON('react-dom')
// 根据包名获取包入口路径
const pkgPath = resolvePkgPath(name)
// 根据包名获取产物路径
const pkgDistPath = resolvePkgPath(name, true)

const basePlugins = getBaseRollupPlugins()

export default [
  // Reactv17的react-dom与Reactv18的react-dom/client
  {
    input: `${pkgPath}/${module}`,
    output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: 'index.js',
        format: 'umd'
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: 'client.js',
        format: 'umd'
      }
    ],
    external: [...Object.keys(peerDependencies)], // 避免因为hook的内部数据共享层把react打包进来，这样只剩react的内部数据共享层，实现共用
    plugins: [
      ...basePlugins,
      // 解析路径别名
      aias({
        entries: {
          hostConfig: `${pkgPath}/src/hostConfig.ts`
        }
      }),
      // 自定义生成打包产物的package.json
      generatePackageJson({
        inputFolder: pkgPath,
        outputFolder: pkgDistPath,
        baseContents: ({ name, description, version }) => ({
          name,
          description,
          version,
          peerDependencies: {
            react: version
          },
          main: 'index.js' // 由umd支持
        })
      })
    ]
  }
]
