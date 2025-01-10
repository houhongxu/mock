import { Flags, NoFlags } from './ReactFiberFlags'
import { Hook } from './ReactFiberHooks'
import { FiberRoot } from './ReactFiberRoot'
import { ConcurrentRoot, RootTag } from './ReactRootTags'
import { ConcurrentMode, NoMode, TypeOfMode } from './ReactTypeOfMode'
import { State, UpdateQueue } from './ReactUpdateQueue'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  WorkTag,
} from './ReactWorkTags'
import {
  Instance,
  Key,
  ReactElement,
  TextInstance,
  Type,
} from 'shared/ReactTypes'

export class Fiber {
  tag: WorkTag
  key: Key
  type: Type | null

  return: Fiber | null
  sibling: Fiber | null
  child: Fiber | null
  index: number

  stateNode: Instance | TextInstance | FiberRoot | null

  pendingProps: any
  memoizedProps: any
  memoizedState: Hook | State | null
  updateQueue: UpdateQueue<State> | null

  mode: TypeOfMode

  flags: Flags
  subtreeFlags: Flags
  deletions: Fiber[] | null

  alternate: Fiber | null

  constructor(tag: WorkTag, pendingProps: any, key: Key, mode: TypeOfMode) {
    // ! 实例
    this.tag = tag
    this.key = key
    // div span p / f App() / class App
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
    // fiber root / dom
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
  return new Fiber(tag, pendingProps, key, mode)
}

export function createHostRootFiber(tag: RootTag) {
  console.log('(createHostRootFiber)')

  let mode = NoMode

  if (tag === ConcurrentRoot) {
    // concurrent模式
    mode = ConcurrentMode
  }

  return createFiber(HostRoot, null, null, mode)
}

export function createWorkInProgress(current: Fiber, pendingProps: any) {
  console.log('(createWorkInProgress)')

  let workInProgress = current.alternate

  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    )
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    // 双缓存树互相链接
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
  }

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  return workInProgress
}

export function createFiberFromTypeAndProps(
  type: Type,
  key: Key,
  pendingProps: any,
  mode: TypeOfMode,
) {
  let fiberTag: WorkTag = IndeterminateComponent

  if (typeof type === 'function') {
    fiberTag = FunctionComponent
  } else if (typeof type === 'string') {
    // 例如 <div/> 的type是'div'
    fiberTag = HostComponent
  }

  const fiber = new Fiber(fiberTag, pendingProps, key, mode)

  fiber.type = type

  return fiber
}

export function createFiberFromElement(
  element: ReactElement,
  mode: TypeOfMode,
): Fiber {
  const type = element.type
  const key = element.key
  const pendingProps = element.props

  const fiber = createFiberFromTypeAndProps(type, key, pendingProps, mode)

  return fiber
}

export function createFiberFromText(content: string, mode: TypeOfMode) {
  const fiber = createFiber(HostText, content, null, mode)

  return fiber
}
