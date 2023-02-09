# 实现 react

实现原则为最小实现原则，部分功能为方便实现简化

## 代码规范

当项目比较复杂时，lint 时间过长，可以用 lint-staged 使用 git 缓存进行 lint

### commitlint

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

## dev 模式调试

pnpm dev

## react 特性

- react jsx->没有编译优化->协调渲染->宿主环境 api->UI，所以是运行时框架

## 待整理

1. 与[react17 源码调试](https://react.iamkasong.com/)的各章节流程概览结合，将各个流程整理成笔记
2. 手写的 react 与 react 源码一起对比调试熟练并记录
