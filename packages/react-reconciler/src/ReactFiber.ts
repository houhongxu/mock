import { ConcurrentRoot, RootTag } from './ReactRootTags'
import { ConcurrentMode, NoMode, TypeOfMode } from './ReactTypeOfMode'
import { HostRoot, WorkTag } from './ReactWorkTags'
import { Key } from 'shared/ReactTypes'

export class FiberNode {
  tag: WorkTag
  key: Key

  stateNode: any

  pendingProps: any

  mode: TypeOfMode

  alternate: FiberNode | null

  constructor(tag: WorkTag, pendingProps: any, key: Key, mode: TypeOfMode) {
    this.tag = tag
    this.key = key

    this.stateNode = null

    this.pendingProps = pendingProps

    this.mode = mode

    this.alternate = null
  }
}

export function createFiber(
  tag: WorkTag,
  pendingProps: any,
  key: Key,
  mode: TypeOfMode,
) {
  return new FiberNode(tag, pendingProps, key, mode)
}

export function createHostRootFiber(tag: RootTag) {
  let mode = NoMode

  if (tag === ConcurrentRoot) {
    // concurrent模式
    mode = ConcurrentMode
  }

  return createFiber(HostRoot, null, null, mode)
}

export function createWorkInProgress(current: FiberNode, pendingProps: any) {
  let workInProgress = current.alternate

  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    )
    workInProgress.stateNode = current.stateNode

    // 双缓存树互相链接
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
  }

  return workInProgress
}
