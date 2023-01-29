import { readFileSync } from 'fs'
import { resolve } from 'path'
import pluginCjs from '@rollup/plugin-commonjs'
import pluginTs from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'

const PACKAGE_PATH = resolve(__dirname, '../../packages')
// ? 打包在node_modules里面
const DIST_PATH = resolve(__dirname, '../../dist/node_modules')

/**
 * 根据包名解析包路径
 */
export function resolvePkgPath(pkgName, isDist) {
  if (isDist) {
    return `${DIST_PATH}/${pkgName}`
  }
  return `${PACKAGE_PATH}/${pkgName}`
}

/**
 * 根据包名获取package.json
 */
export function getPkgJSON(pkgName) {
  const path = `${resolvePkgPath(pkgName)}/package.json`
  const str = readFileSync(path, { encoding: 'utf-8' })

  return JSON.parse(str)
}

export function getBaseRollupPlugins({
  alias = { __DEV__: true },
  tsconfig = {}
} = {}) {
  // 1. cjs转换为esm
  // 2. ts转换为js
  return [replace(alias), pluginCjs(), pluginTs(tsconfig)]
}
