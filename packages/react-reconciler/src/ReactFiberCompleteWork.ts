import { Fiber } from './ReactFiber'
import { NoFlags } from './ReactFiberFlags'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'
import { appendInitialChild, createInstance } from 'HostConfig'
import { Instance } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

function appendAllChildren(parent: Instance, workInProgress: Fiber) {
  console.log('[appendAllChildren]', parent, clone(workInProgress))

  let node = workInProgress.child

  while (node !== null) {
    // 子
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode as Instance)
    } else if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === workInProgress) {
      return
    }

    // 父
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }

      node = node?.return
    }

    // 兄
    node.sibling.return = node.return
    node = node.sibling
  }
}

// 冒泡收集flag
function bubbleProperties(completedWork: Fiber) {
  let subtreeFlags = NoFlags

  let child = completedWork.child

  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags

    child = child.sibling
  }

  completedWork.subtreeFlags |= subtreeFlags
}

export function completeWork(current: Fiber | null, workInProgress: Fiber) {
  console.log(
    '(completeWork)',
    current !== null && workInProgress.stateNode !== null,
    clone(workInProgress),
  )

  const newProps = workInProgress.pendingProps

  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress)

      return null
    case HostComponent:
      if (current !== null && workInProgress.stateNode !== null) {
        // ! update
      } else {
        // ! mount
        const type = workInProgress.type

        const instance = createInstance(type, newProps)

        appendAllChildren(instance, workInProgress)

        workInProgress.stateNode = instance
      }

      bubbleProperties(workInProgress)

      return null
  }

  return null
}
