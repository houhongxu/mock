# react-dom

是 react-reconciler 和 hostConfig 一起打包生成的包

## hooks

react-reconciler 与 react 有内部数据共享层依赖，而 react-dom 依赖 react-reconciler，所以 react-dom 打包会将 react 打包

所以打包需要排除 react 包

这样只剩一个 react 包内部数据共享层，实现共用

## peerDependencies

对等依赖，安装包的同时也会要求宿主环境的安装包满足版本条件

如果用户显式依赖了 react 库，则可以忽略 react-dom 的 peerDependency 声明；

如果用户没有显式依赖 react 库，则按照 react-dom 的 peerDependencies 中声明的版本将 react 库安装到项目根目录中；

当用户依赖的 react 库版本、与 react-dom 依赖的版本之间不相互兼容，会报错让用户自行修复；
