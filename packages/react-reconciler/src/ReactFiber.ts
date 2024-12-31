import { Flags, NoFlags } from './ReactFiberFlags'
import { Hook } from './ReactFiberHooks'
import { FiberRootNode } from './ReactFiberRoot'
import { ConcurrentRoot, RootTag } from './ReactRootTags'
import { ConcurrentMode, NoMode, TypeOfMode } from './ReactTypeOfMode'
import { State, UpdateQueue } from './ReactUpdateQueue'
import { HostRoot, WorkTag } from './ReactWorkTags'
import { Key, Type } from 'shared/ReactTypes'

export class FiberNode {
  tag: WorkTag
  key: Key
  type: Type | null

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  stateNode: Element | FiberRootNode | null

  pendingProps: any
  memoizedProps: any
  memoizedState: Hook | State | null
  updateQueue: UpdateQueue<State> | null

  mode: TypeOfMode

  flags: Flags
  subtreeFlags: Flags
  deletions: FiberNode[] | null

  alternate: FiberNode | null

  constructor(tag: WorkTag, pendingProps: any, key: Key, mode: TypeOfMode) {
    // ! 实例
    this.tag = tag
    this.key = key
    this.type = null

    // ! 树
    // 父
    this.return = null
    // 兄
    this.sibling = null
    // 子
    this.child = null
    // sibling索引
    this.index = 0

    // ! dom
    this.stateNode = null

    // ! 工作单元
    // new props
    this.pendingProps = pendingProps
    // old props
    this.memoizedProps = null
    // state
    this.memoizedState = null
    // 更新链表
    this.updateQueue = null
    // ! 模式
    // 模式，区分render和createRoot入口
    this.mode = mode

    // ! 副作用
    this.flags = NoFlags
    this.subtreeFlags = NoFlags
    this.deletions = null

    // ! 双缓存
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
  console.log('[createHostRootFiber]')

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

  workInProgress.memoizedProps = current.memoizedProps

  return workInProgress
}
