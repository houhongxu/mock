import { Fiber } from './ReactFiber'
import { NoFlags } from './ReactFiberFlags'
import { HostComponent, HostRoot } from './ReactWorkTags'

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
  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress)

      return null
    case HostComponent:
      bubbleProperties(workInProgress)

      return null
  }

  return null
}
