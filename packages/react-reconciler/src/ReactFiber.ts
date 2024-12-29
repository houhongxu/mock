import { ConcurrentRoot, RootTag } from './ReactRootTags'
import { ConcurrentMode, NoMode, TypeOfMode } from './ReactTypeOfMode'
import { HostRoot, WorkTag } from './ReactWorkTags'
import { Key } from 'shared/ReactTypes'

export class FiberNode {
  tag: WorkTag
  stateNode: any
  pendingProps: any
  mode: TypeOfMode

  constructor(tag: WorkTag, pendingProps: any, mode: TypeOfMode) {
    this.tag = tag

    this.stateNode = null

    this.pendingProps = pendingProps

    this.mode = mode
  }
}

export function createFiber(
  tag: WorkTag,
  pendingProps: any,
  key: Key,
  mode: TypeOfMode,
) {
  return new FiberNode(tag, pendingProps, mode)
}

export function createHostRootFiber(tag: RootTag) {
  let mode = NoMode

  if (tag === ConcurrentRoot) {
    // concurrent模式
    mode = ConcurrentMode
  }

  return createFiber(HostRoot, null, null, mode)
}
