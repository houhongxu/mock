import { Fiber } from './ReactFiber'
import { MutationMask, NoFlags, Placement, Update } from './ReactFiberFlags'
import { FiberRoot } from './ReactFiberRoot'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'
import {
  appendChild,
  commitTextUpdate,
  commitUpdate,
  insertBefore,
} from 'HostConfig'
import { Instance } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

let inProgressRoot: FiberRoot | null

let nextEffect: Fiber | null

function isHostParent(fiber: Fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}

function getHostParentFiber(fiber: Fiber) {
  let parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
}

function getHostSibling(fiber: Fiber) {
  let node = fiber

  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }

      node = node.return
    }

    node.sibling.return = node.return
    node = node.sibling

    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }
}

function insertOrAppendPlacementNode(
  node: Fiber,
  before: Instance,
  parent: Instance,
) {
  const { tag } = node
  const isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    const stateNode = node.stateNode as Element | Text

    if (before) {
      insertBefore(parent, stateNode, before)
    } else {
      appendChild(parent, stateNode)
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(
  node: Fiber,
  before: Instance,
  parent: Instance,
) {
  const { tag } = node
  const isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    const stateNode = node.stateNode as Element | Text

    if (before) {
      insertBefore(parent, stateNode, before)
    } else {
      appendChild(parent, stateNode)
    }
  }
}

function commmitPlacement(finishedWork: Fiber) {
  // 获取最近的父dom fiber
  const parentFiber = getHostParentFiber(finishedWork)

  switch (parentFiber?.tag) {
    case HostComponent:
      const componentParent = parentFiber.stateNode as Instance

      // 获取最近的兄dom fiber
      const componentBefore = getHostSibling(finishedWork) as Instance

      insertOrAppendPlacementNode(
        finishedWork,
        componentBefore,
        componentParent,
      )

    case HostRoot:
      const rootParent = (parentFiber.stateNode as FiberRoot).containerInfo
      const rootBefore = getHostSibling(finishedWork) as Instance

      insertOrAppendPlacementNodeIntoContainer(
        finishedWork,
        rootBefore,
        rootParent,
      )
  }
}
function commitWork(current: Fiber | null, finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case HostRoot:
      return
    case HostComponent:
      const instance = finishedWork.stateNode

      if (instance != null) {
        const newProps = finishedWork.memoizedProps

        const oldProps = current !== null ? current.memoizedProps : newProps

        const type = finishedWork.type

        const updatePayload = finishedWork.updateQueue

        finishedWork.updateQueue = null

        if (updatePayload !== null) {
          commitUpdate(instance as Element, type, oldProps, newProps)
        }
      }
      return
    case HostText: {
      if (finishedWork.stateNode === null) {
        throw new Error('commitWork')
      }

      const textInstance = finishedWork.stateNode as Text

      const newText: string = finishedWork.memoizedProps
      const oldText: string = current !== null ? current.memoizedProps : newText

      commitTextUpdate(textInstance, oldText, newText)

      return
    }
  }
}

function commitMutationEffectsOnFiber(finishedWork: Fiber, root: FiberRoot) {
  console.log('[commitMutationEffectsOnFiber]', finishedWork.stateNode)

  const flags = finishedWork.flags

  const primaryFlags = flags & (Placement | Update)

  switch (primaryFlags) {
    case Placement:
      commmitPlacement(finishedWork)

      finishedWork.flags &= ~Placement

      break

    case Update: {
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
  }
}

function commitMutationEffects_complete(root: FiberRoot) {
  console.log('(commitMutationEffects_complete)')

  while (nextEffect !== null) {
    const fiber = nextEffect

    try {
      commitMutationEffectsOnFiber(fiber, root)
      console.log('[commitMutationEffectsOnFiber] finish', clone(fiber))
    } catch (e) {
      console.error(e)
    }

    // 兄
    const sibling = fiber.sibling

    if (sibling !== null) {
      nextEffect = sibling
      return
    }

    // 父
    nextEffect = fiber.return
  }
}

function commitMutationEffects_begin(root: FiberRoot) {
  console.log('(commitMutationEffects_begin)')

  while (nextEffect !== null) {
    const fiber = nextEffect

    // 删
    const deletions = fiber.deletions

    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const childToDelete = deletions[i]
      }
    }

    const child = fiber.child

    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      // 子
      nextEffect = child
    } else {
      commitMutationEffects_complete(root)
    }
  }
}

export function commitMutationEffects(root: FiberRoot, firstChild: Fiber) {
  console.log('(commitMutationEffects)')

  inProgressRoot = root
  nextEffect = firstChild

  commitMutationEffects_begin(root)

  inProgressRoot = null
}
