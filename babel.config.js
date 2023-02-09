// jest会自动通过babel编译测试用例

module.exports = {
  presets: ['@babel/preset-env'],
  // 进行jsx编译
  plugins: [['@babel/plugin-transform-react-jsx', { throwIfNamespace: false }]]
}
