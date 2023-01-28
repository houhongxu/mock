# react-conciler

## 双缓存

内存中同时存在两颗 FiberNode 树

- current：与视图中真实 UI 对应的 fiberNode 树
- workInProgress：触发更新后，正在 reconciler 中计算的 fiberNode 树

更新后 current 和 workInProgress 引用互相替换
