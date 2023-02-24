// 递归中的[归]工作，处理副作用并生成离屏DOM

import {
  appendInitialChild,
  createInstance,
  createTextInstance
} from 'hostConfig'
import { FiberNode } from './fiber'
import { NoFlags, Update } from './fiberFlags'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText
} from './workTags'

/**
 * !!! 完成[归]工作
 * @description 从最深层开始，一层层创建离屏DOM树
 */
export function completeWork(wip: FiberNode) {
  // 获取更新后的属性
  const newProps = wip.pendingProps
  // 获取fiberNode-current
  const current = wip.alternate

  switch (wip.tag) {
    case HostComponent:
      if (current !== null && wip.stateNode) {
        // ! update
      } else {
        // ! mount
        // 创建DOM-workInProgress，因为是[归]，所以肯定在DOM树中最上方
        const instance = createInstance(wip.type, newProps)
        // 将所有子离屏DOM连接DOM-workInProgress
        appendAllChildren(instance, wip)
        // 连接workInProgress与DOM-workInProgress
        wip.stateNode = instance
      }
      // 将子层副作用冒泡
      bubbleProperties(wip)

      return null
    case HostText:
      if (current !== null && wip.stateNode) {
        // ! update
        const oldText = current.memoizedProps.content
        const newText = newProps.content

        if (oldText !== newText) {
          markUpdate(wip)
        }
      } else {
        // ! mount
        // 创建DOM-workInProgress
        const instance = createTextInstance(newProps.content)
        // 文本节点没有子节点
        wip.stateNode = instance
      }
      // 将子层副作用冒泡
      bubbleProperties(wip)

      return null

    case HostRoot:
      // 没有离屏DOM
      bubbleProperties(wip)

      return null

    case FunctionComponent:
      // 没有离屏DOM
      bubbleProperties(wip)

      return null
    default:
      if (__DEV__) {
        console.warn('completeWork未实现的类型', wip)
        break
      }
  }
}

/**
 * 连接DOM-workInProgress与所有子离屏DOM
 * @description 在DOM-workInProgress对应的离屏DOM下，插入fiberNode-workInProgress以及其所有的子对应的离屏DOM，因为completeWork是从最深层开始，所以倒数第一层执行此函数将无操作，倒数第二层以后则会有未知数量的子离屏DOM挂载，所以仅挂载子离屏DOM就可以生成完整的离屏DOM树
 */
function appendAllChildren(parent: any, wip: FiberNode) {
  // 获取子fiberNode
  let node = wip.child

  // ! 遍历所有子fiberNode，将找到的子DOM连接到DOM-workInProgress
  while (node !== null) {
    if (node?.tag === HostComponent || node?.tag === HostText) {
      // 连接DOM-workInProgress与当前fiberNode对应的DOM
      appendInitialChild(parent, node.stateNode)
    } else if (node.child !== null) {
      // 没有在当前层找到则[递]到下一层查找，规避Fragment等不含离屏DOM的fiberNode
      // ! 兜底 连接当前fiberNode的子与其本身，因为该错误很难排查
      node.child.return = node
      // [递]
      node = node.child
      continue
    }

    // ! 兜底 循环结束条件
    if (node === wip) {
      return
    }

    // [归]
    while (node.sibling === null) {
      if (node.return === null || node.return === wip) {
        return
      }
      node = node?.return
    }

    // ! 兜底 连接当前fiberNode兄弟与其父，因为该错误很难排查
    node.sibling.return = node.return
    // 进行兄弟fiberNode的递归
    node = node.sibling
  }
}

/**
 * 收集子fiberNode副作用，只收集一层因为是递归向上的，子层已经包含了孙子层的副作用
 * @description 性能优化,利用completeWork向上[归]的流程，将子层所有fiberNode的flags冒泡到当前fiberNode
 */
function bubbleProperties(wip: FiberNode) {
  // 初始化子树副作用
  let subtreeFlags = NoFlags
  // 获取子fiberNode
  let child = wip.child

  // ! 遍历所有子fiberNode
  while (child !== null) {
    // 标记当前节点所有孩子节点的flags
    subtreeFlags |= child.subtreeFlags
    // 标记当前节点的flags
    subtreeFlags |= child.flags

    // ! 兜底 连接child与父，因为该错误很难排查
    child.return = wip
    // 遍历兄弟
    child = child.sibling
  }

  // 收集到子树副作用属性
  wip.subtreeFlags |= subtreeFlags
}

/**
 * 标记更新
 */
function markUpdate(fiber: FiberNode) {
  fiber.flags |= Update
}
