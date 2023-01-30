// 递归中的归

import {
  appendInitialChild,
  createInstance,
  createTextInstance
} from 'hostConfig'
import { FiberNode } from './fiber'
import { NoFlags } from './fiberFlags'
import { HostComponent, HostRoot, HostText } from './workTags'

/**
 * 在parent下插入wip
 */
function appendAllChildren(parent: FiberNode, wip: FiberNode) {
  let node = wip.child

  while (node !== null) {
    if (node?.tag === HostComponent || node?.tag === HostText) {
      // 插入
      appendInitialChild(parent, node.stateNode)
    } else if (node.child !== null) {
      // 递
      node.child.return = node
      node = node.child
      continue
    }

    // 循环结束条件
    if (node === wip) {
      return
    }

    // 归
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return
      }
      node = node?.return
    }

    node.sibling.return = node.return
    node = node.sibling
  }
}

/**
 * 性能优化利用completeWork向上遍历（归）的流程，将子fiberNode的flags冒泡到父fiberNode
 */
function bubbleProperties(wip: FiberNode) {
  let subtreeFlags = NoFlags
  let child = wip.child

  while (child !== null) {
    // 当前节点子节点的flag
    subtreeFlags |= child.subtreeFlags
    // 当前节点的flag
    subtreeFlags |= child.flags

    child.return = wip
    child = child.sibling
  }

  wip.subtreeFlags |= subtreeFlags
}

/**
 * 完成工作
 */
export function completeWork(wip: FiberNode) {
  const newProps = wip.pendingProps
  const current = wip.alternate

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // ! update
      } else {
        // ! mount
        // 构建DOM
        const instance = createInstance(wip.type, newProps)
        // 将DOM插入DOM树
        appendAllChildren(instance, wip)
        wip.stateNode = instance
      }
      bubbleProperties(wip)
      return null
    case HostText:
      if (current !== null && wip.stateNode) {
        // ! update
      } else {
        // ! mount
        // 构建DOM
        const instance = createTextInstance(newProps.content)
        wip.stateNode = instance
      }
      bubbleProperties(wip)

      return null

    case HostRoot:
      bubbleProperties(wip)

      return null
    default:
      if (__DEV__) {
        console.warn('completeWork未实现的类型', wip)
        break
      }
  }
}
