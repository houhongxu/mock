// 工作循环

import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import { HostRoot } from './workTags'

let workInProgress: FiberNode | null = null

/**
 * 从fiber开始遍历到fiberRootNode
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  // 拷贝fiber
  let node = fiber
  // 获取父节点
  let parent = node.return
  // 循环获取父节点
  while (parent !== null) {
    node = parent
    parent = node.return
  }
  // 获取fiberRootNode
  if (node.tag === HostRoot) {
    return node.stateNode
  }

  return null
}

/**
 * 初始化hostFiberNode-workInProgress
 */
function prepareRefreshStack(root: FiberRootNode) {
  // 获取hostFiberNode-workInProgress
  workInProgress = createWorkInProgress(root.current, {})
}

/**
 * 完成工作单元
 */
function completeUnitOfWork(fiber: FiberNode) {
  // 拷贝fiber
  let node: FiberNode | null = fiber

  // 遍历兄弟节点
  do {
    // 完成工作
    completeWork(node)

    const sibling = node.sibling

    if (sibling !== null) {
      // 如果兄弟节点存在则遍历兄弟节点
      workInProgress = sibling
      return
    }

    // 如果兄弟节点不存在则归到父节点
    node = node.return
    workInProgress = node
  } while (node !== null)
}

/**
 * 执行工作单元
 */
function performUnitOfWork(fiber: FiberNode) {
  // 开始递工作并获取子FiberNode
  const next = beginWork(fiber)
  // 更新props为工作处理后的props
  fiber.memoizedProps = fiber.pendingProps

  if (next === null) {
    // 如果没有子FiberNode则说明已经递到最深层，进行归操作
    completeUnitOfWork(fiber)
  } else {
    // 如果有子FiberNode则遍历子FiberNode(workInProgress!==null时循环调用此函数)
    workInProgress = next
  }
}

/**
 * 工作循环
 */
function workLoop() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

/**
 * 初始化fiberRootNode并开始工作循环
 */
function renderRoot(root: FiberRootNode) {
  // 初始化hostFiberNode-workInProgress
  prepareRefreshStack(root)

  do {
    try {
      // 开始工作循环
      workLoop()
      break
    } catch (e) {
      if (__DEV__) {
        console.warn('workInProgress发生错误', e)
      }

      workInProgress = null
    }
  } while (true)
}

/**
 * 在fiber中调度更新流程
 * @description 传入的fiber可为任意应用内组件对应的fiber
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // TODO 调度功能

  // 获取fiberRootNode
  const root = markUpdateFromFiberToRoot(fiber)

  // 初始化fiberRootNode并开始工作
  renderRoot(root)
}
