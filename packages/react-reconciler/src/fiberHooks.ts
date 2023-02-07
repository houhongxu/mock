import { FiberNode } from './fiber'

export function renderWithHooks(wip: FiberNode) {
  // 获取组件函数
  const Component = wip.type
  // 获取组件的属性
  const props = wip.pendingProps
  // 执行函数得到子ReactElement
  const children = Component(props)

  return children
}
