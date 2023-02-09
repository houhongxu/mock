const { defaults } = require('jest-config')

module.exports = {
  // 引入默认配置
  ...defaults,
  rootDir: process.cwd(), // 测试根路径为命令执行时的根目录（package.json）
  modulePathIgnorePatterns: ['<rootDir>/.history', '<rootDir>/prod-test'], // 忽略.history
  moduleDirectories: [
    // 对于 React ReactDOM 包
    'dist/node_modules',
    // 对于第三方依赖
    ...defaults.moduleDirectories
  ],
  testEnvironment: 'jsdom' // 宿主环境
}
