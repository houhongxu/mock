import internals from 'shared/internals'
import { FiberNode } from './fiber'

let currentlyRenderingFiber: FiberNode | null = null
const workInProgressHook: Hook | null = null

const { currentDispatcher } = internals

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

export function renderWithHooks(wip: FiberNode) {
  // 记录当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = wip
  // 初始化指向hook链表的属性
  wip.memoizedState = null

  const current = wip.alternate

  if (current !== null) {
    // ! update
  } else {
    // ! mount
    currentDispatcher.current = null
  }

  // 获取组件函数
  const Component = wip.type
  // 获取组件的属性
  const props = wip.pendingProps
  // 执行函数得到子ReactElement
  const children = Component(props)

  // 重置当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = null

  return children
}
