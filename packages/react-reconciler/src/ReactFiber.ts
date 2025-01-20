import { Flags, NoFlags } from './ReactFiberFlags'
import { Hook } from './ReactFiberHooks'
import { FiberRoot } from './ReactFiberRoot'
import { ComponentState } from './ReactInternalTypes'
import { ConcurrentRoot, RootTag } from './ReactRootTags'
import { ConcurrentMode, NoMode, TypeOfMode } from './ReactTypeOfMode'
import { UpdateQueue } from './ReactUpdateQueue'
import {
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  WorkTag,
} from './ReactWorkTags'
import { REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols'
import {
  Instance,
  Key,
  Owner,
  Props,
  ReactElement,
  ReactFragment,
  Ref,
  TextInstance,
  Type,
} from 'shared/ReactTypes'

export class Fiber {
  tag: WorkTag
  key: Key
  elementType: Type | null
  type: Type | null

  return: Fiber | null
  sibling: Fiber | null
  child: Fiber | null
  index: number

  stateNode: Instance | TextInstance | FiberRoot | null
  ref: Ref

  pendingProps: Props
  memoizedProps: Props
  memoizedState: any
  updateQueue: UpdateQueue<any> | null

  mode: TypeOfMode

  flags: Flags
  subtreeFlags: Flags
  deletions: Fiber[] | null

  alternate: Fiber | null

  constructor(tag: WorkTag, pendingProps: Props, key: Key, mode: TypeOfMode) {
    // ! 实例
    this.tag = tag
    this.key = key
    // memo forwardRef等，elementType是原始组件，type是高级组件
    this.elementType = null
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
    this.ref = null

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
  pendingProps: Props,
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

export function createWorkInProgress(current: Fiber, pendingProps: Props) {
  console.log('(createWorkInProgress)')

  let workInProgress = current.alternate

  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    )

    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    // 双缓存树互相链接
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type

    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
  }

  workInProgress.flags = current.flags
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue

  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref

  return workInProgress
}

export function createFiberFromTypeAndProps(
  type: Type,
  key: Key,
  pendingProps: Props,
  mode: TypeOfMode,
) {
  let fiberTag: WorkTag = IndeterminateComponent
  let resolvedType = type

  if (typeof type === 'function') {
    fiberTag = FunctionComponent // ClassComponent
  } else if (typeof type === 'string') {
    // 例如 <div/> 的type是'div'
    fiberTag = HostComponent
  } else {
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, key)
    }
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode)

  fiber.elementType = type
  fiber.type = resolvedType

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

export function createFiberFromFragment(
  elements: ReactFragment,
  mode: TypeOfMode,
  key: null | string,
): Fiber {
  const fiber = createFiber(Fragment, elements, key, mode)

  return fiber
}
