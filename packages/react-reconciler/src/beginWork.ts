// 递归中的递阶段，进行结构处理，标记Placement与ChildDeletion，不进行Update

import { ReactElement } from 'shared/ReactTypes'
import { mountChildFibers, reconcileChildFibers } from './childFibers'
import { FiberNode } from './fiber'
import { processUpdateQueue, UpdateQueue } from './updateQueue'
import { HostRoot, HostComponent, HostText } from './workTags'

function reconcileChildren(wip: FiberNode, children?: ReactElement) {
  const current = wip.alternate

  if (current !== null) {
    // update
    // 进行子FiberNode对比
    wip.child = reconcileChildFibers(wip, current?.child, children)
  } else {
    // mount
    wip.child = mountChildFibers(wip, null, children)
  }
}

/**
 * 获取子FiberNode
 */
function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps
  const nextChildren = nextProps.children

  reconcileChildren(wip, nextChildren)
  return wip.child
}

/**
 * 更新状态并获取子FiberNode
 */
function updateHostRoot(wip: FiberNode) {
  // 更新状态
  const baseState = wip.memoizedState
  const updateQueue = wip.updateQueue as UpdateQueue<Element>
  const pending = updateQueue.shared.pending
  updateQueue.shared.pending = null

  const { memoizedState } = processUpdateQueue(baseState, pending)

  wip.memoizedState = memoizedState

  // 获取子ReactElement，而需要对比的子FiberNode为wip.alternate?.child
  const nextChildren = wip.memoizedState

  // 获取更新后的子FiberNode
  reconcileChildren(wip, nextChildren)
  return wip.child
}

/**
 * 开始工作
 */
export function beginWork(wip: FiberNode) {
  // 比较子节点的ReactElement与FiberNode，返回子FiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip)
    case HostComponent:
      return updateHostComponent(wip)
    case HostText:
      return null
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型', wip)
        break
      }
  }

  return null
}
