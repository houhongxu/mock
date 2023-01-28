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
