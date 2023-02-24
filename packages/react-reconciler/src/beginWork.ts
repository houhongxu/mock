// 递归中的[递]工作，进行结构处理，标记Placement与ChildDeletion，不进行Update

import { ReactElement } from 'shared/ReactTypes'
import { mountChildFibers, reconcileChildFibers } from './childFibers'
import { FiberNode } from './fiber'
import { renderWithHooks } from './fiberHooks'
import { processUpdateQueue, UpdateQueue } from './updateQueue'
import {
  HostRoot,
  HostComponent,
  HostText,
  FunctionComponent
} from './workTags'

/**
 * 开始[递]工作
 * @description 根据传入的fiberNode创建子fiberNode，并将这两个fiberNode连接起来
 */
export function beginWork(wip: FiberNode) {
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip)
    case HostComponent:
      return updateHostComponent(wip)
    case HostText:
      return null
    case FunctionComponent:
      return updateFunctionComponent(wip)
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型', wip)
        break
      }
  }

  return null
}

/**
 * 更新HostRoot状态并获取子fiberNode
 */
function updateHostRoot(wip: FiberNode) {
  // 获取当前状态
  const baseState = wip.memoizedState
  // 获取更新实例队列
  const updateQueue = wip.updateQueue as UpdateQueue<ReactElement>
  // 获取更新实例
  const pending = updateQueue.shared.pending
  updateQueue.shared.pending = null
  // 获取更新后的状态并更新
  const { memoizedState } = processUpdateQueue(baseState, pending)

  // ! 第一次mount时是react根组件对应的ReactElement
  wip.memoizedState = memoizedState

  // 获取子ReactElement，而需要对比的子FiberNode为wip.alternate?.child
  const nextChildren = wip.memoizedState

  // 获取更新后的子fiberNode
  reconcileChildren(wip, nextChildren)
  return wip.child
}

/**
 * 获取子fiberNode
 */
function updateHostComponent(wip: FiberNode) {
  // 获取子ReactElement
  const nextProps = wip.pendingProps
  const nextChildren = nextProps.children

  reconcileChildren(wip, nextChildren)
  return wip.child
}

/**
 * 获取函数组件处理后的子fiberNode
 */
function updateFunctionComponent(wip: FiberNode) {
  // 获取子ReactElement
  const nextChildren = renderWithHooks(wip)

  reconcileChildren(wip, nextChildren)
  return wip.child
}

/**
 * !!! 协调子fiberNode-current与子ReactElement，返回协调好的fiberNode-workInProgress
 */
function reconcileChildren(wip: FiberNode, children?: ReactElement) {
  // 获取fiberNode-current
  const current = wip.alternate

  // 获取fiberNode-workInProgress
  if (current !== null) {
    // ! update，因为有已渲染的fiberNode-current树
    // ! 因为mount是hostRootFiber是同时有current与workInprogress的，所以进入此处进行了根节点副作用标记，mount时仅标记根节点可以性能优化，将子树一起插入div-root
    wip.child = reconcileChildFibers(wip, current?.child, children)
  } else {
    // ! mount
    wip.child = mountChildFibers(wip, null, children)
  }
}
