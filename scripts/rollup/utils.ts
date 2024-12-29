import { DIST_PATH, PACKAGES_PATH } from './constants'
import rollupPluginCommonjs from '@rollup/plugin-commonjs'
import rollupPluginTypescript from '@rollup/plugin-typescript'
import { readFileSync } from 'fs'
import path from 'path'

export function resolvePkgPath(pkgName: string, isDist = false) {
  return `${isDist ? DIST_PATH : PACKAGES_PATH}/${pkgName}`
}

export function getPkgJson(pkgName: string) {
  const str = readFileSync(
    path.join(PACKAGES_PATH, pkgName, './package.json'),
    {
      encoding: 'utf-8',
    },
  )

  return JSON.parse(str)
}

export function getBaseRollupPlugins() {
  return [rollupPluginCommonjs(), rollupPluginTypescript()]
}
