# 实现 react

## 代码规范

当项目比较复杂时，lint 时间过长，可以用 lint-staged 使用 git 缓存进行 lint

## commitlint

build
chore
ci
docs
feat
fix
perf
refactor
revert
style
test

## link 模式调试

- 进入 dist/node_modules/[pkgName] 内的调试包，执行 pnpm link --global 进行全局 link

- 回到项目根目录，执行 npx create-react-app [pkgName]-test 创建调试项目，执行 pnpm link [pkgName] --global 给调试项目引入全局的调试包
