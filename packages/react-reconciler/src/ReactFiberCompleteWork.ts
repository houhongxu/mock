import { Fiber } from './ReactFiber'
import { NoFlags, Ref, Update } from './ReactFiberFlags'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './ReactWorkTags'
import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  prepareUpdate,
} from 'HostConfig'
import { Instance, Props, Type } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

function markUpdate(workInProgress: Fiber) {
  workInProgress.flags |= Update
}

function markRef(workInProgress: Fiber) {
  workInProgress.flags |= Ref
}

function appendAllChildren(parent: Instance, workInProgress: Fiber) {
  console.log('[appendAllChildren]', parent)

  let node = workInProgress.child

  while (node !== null) {
    console.log(node)

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

function updateHostText(
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string,
) {
  if (oldText !== newText) {
    markUpdate(workInProgress)
  }
}

function updateHostComponent(
  current: Fiber,
  workInProgress: Fiber,
  type: Type,
  newProps: Props,
) {
  const oldProps = current.memoizedProps

  if (oldProps === newProps) {
    return
  }

  const instance = workInProgress.stateNode

  if (!instance) {
    throw Error('updateHostComponent')
  }

  const updatePayload = prepareUpdate(
    instance as Element,
    type,
    oldProps,
    newProps,
  )

  workInProgress.updateQueue = updatePayload

  // if (updatePayload) {
  markUpdate(workInProgress)
  // }
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
    case FunctionComponent:
    case HostRoot:
      bubbleProperties(workInProgress)

      return null
    case HostComponent:
      if (current !== null && workInProgress.stateNode !== null) {
        // ! update

        const type = workInProgress.type

        updateHostComponent(current, workInProgress, type, newProps)

        if (current.ref !== workInProgress.ref) {
          markRef(workInProgress)
        }
      } else {
        // ! mount
        const type = workInProgress.type

        const instance = createInstance(type, newProps)

        appendAllChildren(instance, workInProgress)

        workInProgress.stateNode = instance
      }

      bubbleProperties(workInProgress)

      return null

    case HostText:
      const newText = newProps

      if (current && workInProgress.stateNode !== null) {
        // ! update
        const oldText = current.memoizedProps

        updateHostText(current, workInProgress, oldText, newText)
      } else {
        // ! mount
        const instance = createTextInstance(newText)

        workInProgress.stateNode = instance
      }

      bubbleProperties(workInProgress)

      return null
  }

  return null
}
