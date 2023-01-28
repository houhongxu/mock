// 工作循环

import { beginWork } from './beginWork'
import { completeWork } from './completeWork'
import { FiberNode } from './fiber'

/**
 * 工作中的FiberNode
 */
let workInProgress: FiberNode | null = null

/**
 * 将workInProgress指向根FiberNode
 */
function prepareRefreshStack(fiber: FiberNode) {
  workInProgress = fiber
}

/**
 * 完成工作单元
 */
function completeUnitOfWork(fiber: FiberNode) {
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
  // 开始工作并获取子节点
  const next = beginWork(fiber)
  // 更新props为工作处理后的props
  fiber.memoizedProps = fiber.pendingProps

  if (next === null) {
    // 如果没有子节点则说明已经递到最深层，进行归操作
    completeUnitOfWork(fiber)
  } else {
    // 如果有子节点则遍历子节点(workInProgress!==null时循环调用此函数)
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
 * 初始化根FiberNode并开始工作循环
 */
function renderRoot(root: FiberNode) {
  prepareRefreshStack(root)

  do {
    try {
      workLoop()
      break
    } catch (e) {
      console.warn('workInProgress发生错误', e)
      workInProgress = null
    }
  } while (true)
}
