# react-conciler

## 双缓存

内存中同时存在两颗 FiberNode 树

- current：与视图中真实 UI 对应的 fiberNode 树
- workInProgress：触发更新后，正在 reconciler 中计算的 fiberNode 树

更新后 current 和 workInProgress 引用互相替换

## 更新

### react 更新方法

- ReactDOM.createRoot().render（或老版的 ReactDOM.render）
- this.setState
- useState 的 dispatch 方法

### 更新方式的需求

- 更新可能发生于任意组件，而更新流程是从根节点递归的
- 需要一个统一的根节点保存通用信息

`ReactDOM.createRoot(rootElement).render(<App/>)`

createRoot 创建 fiberRootNode(唯一),rootElement 对应 hostRootFiber，`<App/>`就是组件 App

## render 阶段

beginWork 与 completeWork 都分为 mount 与 update 阶段

### beginWork

[递]工作，一直向下处理子节点

生成 fiberNode 树

### completeWork

[归]工作，先看是否有兄弟节点，如果有则处理兄弟节点使其继续[递]工作，如果没有则返回父节点

生成对应离屏 dom 树

## commit 阶段

### beforeMutation

### mutation

### layout

## hooks

fiberNode 的 memoizedState 指向 hooks 函数链表
