import { appendChildToContainer, Container } from 'hostConfig'
import { FiberNode, FiberRootNode } from './fiber'
import { MutationMask, NoFlags, Placement } from './fiberFlags'
import { HostComponent, HostRoot, HostText } from './workTags'

// 下一个有副作用的fiberNode
let nextEffect: FiberNode | null = null

export function commitMutationEffects(finishedWork: FiberNode) {
  nextEffect = finishedWork

  // ! 遍历所有fiberNode并处理副作用
  while (nextEffect !== null) {
    // [递]
    const child: FiberNode | null = nextEffect.child

    if (
      (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
      child !== null
    ) {
      // 未到底且子fiberNode有副作用
      nextEffect = child
    } else {
      // 到底或者子fiberNode没有副作用
      // [归]
      up: while (nextEffect !== null) {
        // 处理当前fiberNode的副作用
        commitMutationEffectsOnFiber(nextEffect)
        // 获取兄弟fiberNode
        const sibling: FiberNode | null = nextEffect.sibling

        if (sibling !== null) {
          // 从兄弟fiberNode开始递归
          nextEffect = sibling
          break up
        }

        // [归]到父fiberNode
        nextEffect = nextEffect.return
      }
    }
  }
}

/**
 * 处理当前fiberNode的副作用
 */
function commitMutationEffectsOnFiber(finishedWork: FiberNode) {
  // 获取副作用
  const flags = finishedWork.flags

  // 消费Placement副作用
  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork)
    // 移除Placement副作用
    finishedWork.flags &= ~Placement
  }

  // 消费Update

  // 消费ChildDeletion
}

/**
 * 消费Placement副作用
 */
function commitPlacement(finishedWork: FiberNode) {
  if (__DEV__) {
    console.warn('执行Placement操作', finishedWork)
  }
  // 获取父DOM
  const hostParent = getHostParent(finishedWork)
  // 插入DOM到父DOM中
  appendPlacementNodeIntoContainer(finishedWork, hostParent)
}

/**
 * 获取父DOM
 */
function getHostParent(fiber: FiberNode) {
  // 获取父fiberNode
  let parent = fiber.return

  while (parent) {
    // 获取父fiberNode类型
    const parentTag = parent.tag

    // 获取父fiberNode对应的离屏DOM
    if (parentTag === HostComponent) {
      return parent.stateNode as Container
    }
    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container
    }

    // 未获取到则[归]到上一层父fiberNode
    parent = parent.return

    if (__DEV__) {
      console.warn('未找到host parent')
    }
  }
}

/**
 * 插入DOM到父DOM中
 */
function appendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: Container
) {
  // 如果当前fiberNode-finishedWork不包含离屏DOM则向下遍历
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(finishedWork.stateNode, hostParent)
    return
  }

  // ! 遍历所有子层fiberNode，有离屏DOM的挂载到父DOM
  // 获取子fiberNode
  const child = finishedWork.child

  if (child !== null) {
    // [递]
    appendPlacementNodeIntoContainer(child, hostParent)

    // 获取兄弟fiberNode
    let sibling = child.sibling

    // 在兄弟fiberNode递
    while (sibling !== null) {
      appendPlacementNodeIntoContainer(sibling, hostParent)
      sibling = sibling.sibling
    }
  }
}
