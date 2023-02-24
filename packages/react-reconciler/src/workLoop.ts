// 工作循环，workInProgress从hostRootFiber开始

import { beginWork } from './beginWork'
import { commitMutationEffects } from './commitWork'
import { completeWork } from './completeWork'
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber'
import { MutationMask, NoFlags } from './fiberFlags'
import { HostRoot } from './workTags'

// 工作中的fiberNode
let workInProgress: FiberNode | null = null

/**
 * 从fiberRootNode开始调度更新流程
 * @description 传入的fiber可为任意应用内组件对应的fiber
 */
export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // TODO 调度功能

  // 获取fiberRootNode
  const root = markUpdateFromFiberToRoot(fiber)

  // 从fiberRootNode开始渲染workInProgres树
  renderRoot(root)
}

/**
 * 从fiber开始遍历到fiberRootNode
 */
function markUpdateFromFiberToRoot(fiber: FiberNode) {
  // 获取fiber
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
 * 渲染workInProgress树
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
        console.warn('workLoop发生错误', e)
      }

      workInProgress = null
    }
  } while (true)

  // 获取完整的workInProgress树的hostFiberNode-workInProgress
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork

  // 进入commit阶段
  commitRoot(root)
}

/**
 * 初始化hostFiberNode-workInProgress
 */
function prepareRefreshStack(root: FiberRootNode) {
  // 获取hostFiberNode-workInProgress
  workInProgress = createWorkInProgress(root.current, {})
}

/**
 * 工作循环
 * @description 每一次工作循环进行一个fiberNode的处理，会遍历hostFiberNode以及下面所有fiberNode
 */
function workLoop() {
  // ! 遍历所有fiberNode
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

/**
 * 执行工作单元
 */
function performUnitOfWork(fiber: FiberNode) {
  // 开始[递]工作并获取子fiberNode
  const next = beginWork(fiber)
  // 存储prop为叶子fiberNode的props
  fiber.memoizedProps = fiber.pendingProps

  if (next === null) {
    // 如果没有子fiberNode则说明已经递到最深层，进行[归]工作
    completeUnitOfWork(fiber)
  } else {
    // 如果有子fiberNode则赋值给workInProgress使得下一次工作循环继续[递]工作
    workInProgress = next
  }
}

/**
 * 完成工作单元
 */
function completeUnitOfWork(fiber: FiberNode) {
  // 获取fiber
  let node: FiberNode | null = fiber

  // 遍历兄弟节点
  do {
    // 完成[归]工作
    completeWork(node)

    const sibling = node.sibling

    if (sibling !== null) {
      // 如果兄弟节点存在则遍历兄弟节点
      workInProgress = sibling
      return
    }

    // 如果兄弟节点不存在则[归]到父节点
    node = node.return
    workInProgress = node
  } while (node !== null)
}

/**
 * commit
 */
function commitRoot(root: FiberRootNode) {
  // 获取完整的workInProgress树的hostFiberNode-workInProgress
  const finishedWork = root.finishedWork

  if (finishedWork === null) {
    return
  }

  if (__DEV__) {
    console.warn('commit阶段开始', finishedWork)
  }
  // 重置
  root.finishedWork = null

  // 判断是否有副作用需要执行
  const subtreeHasFlags = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasFlags = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasFlags || rootHasFlags) {
    // beforeMutation

    // mutation
    commitMutationEffects(finishedWork)

    // 双缓存切换
    root.current = finishedWork

    // layout
  } else {
    console.log('TODO')
  }
}
