import {
  appendChildToContainer,
  commitUpdate,
  Container,
  removeChild
} from 'hostConfig'
import { FiberNode, FiberRootNode } from './fiber'
import {
  ChildDeletion,
  MutationMask,
  NoFlags,
  Placement,
  Update
} from './fiberFlags'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags'

// 下一个有副作用的fiberNode
let nextEffect: FiberNode | null = null

/**
 * 处理副作用，返回完整的离谱DOM树
 */
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

  // 消费Update副作用
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork)
    // 移除Update副作用
    finishedWork.flags &= ~Update
  }

  // 消费ChildDeletion副作用
  if ((flags & ChildDeletion) !== NoFlags) {
    const delections = finishedWork.deletions
    if (delections !== null) {
      delections.forEach((childToDelete) => {
        commitDeletion(childToDelete)
      })
    }
    // 移除ChildDeletion副作用
    finishedWork.flags &= ~ChildDeletion
  }
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
  if (hostParent !== null) {
    appendPlacementNodeIntoContainer(finishedWork, hostParent)
  }
}

/**
 * 获取父DOM
 */
function getHostParent(fiber: FiberNode): Container | null {
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

  return null
}

/**
 * 插入DOM到父DOM中
 */
function appendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: Container
) {
  // 如果当前fiberNode-finishedWork包含离屏DOM挂载
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    appendChildToContainer(finishedWork.stateNode, hostParent)
    return
  }

  // 如果不包含则遍历查找
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

/**
 * 消费ChildDeletion副作用
 */
function commitDeletion(childToDelete: FiberNode) {
  let rootHostNode: FiberNode | null = null

  commitNestedComponent(childToDelete, (unmountFiber) => {
    switch (unmountFiber.tag) {
      case HostComponent:
        if (rootHostNode === null) {
          rootHostNode = unmountFiber
        }
        // TODO 解绑ref
        return
      case HostText:
        if (rootHostNode === null) {
          rootHostNode = unmountFiber
        }
        return
      case FunctionComponent:
        // TODO useEffect unmount
        return
      default:
        if (__DEV__) {
          console.warn('未处理的unmount类型', unmountFiber)
        }
    }
  })
  // 移除rootHostNode对应的离谱DOM
  if (rootHostNode !== null) {
    const hostParent = getHostParent(childToDelete)
    if (hostParent !== null) {
      removeChild(rootHostNode, hostParent)
    }
  }

  // 移除绑定关系
  childToDelete.return = null
  childToDelete.child = null
}
/**
 * 遍历子树移除离谱DOM
 */
function commitNestedComponent(
  root: FiberNode,
  onCommitUnmount: (fiber: FiberNode) => void
) {
  let node = root

  while (true) {
    // 移除离屏DOM
    onCommitUnmount(node)

    if (node.child !== null) {
      // 递
      // ! 兜底
      node.child.return = node
      // 获取子fiberNode
      node = node.child
      continue
    }

    // ! 兜底
    if (node === root) {
      return
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return
      }
      // 归
      node = node.return
    }

    // ! 兜底
    node.sibling.return = node.return
    node = node.sibling
  }
}
