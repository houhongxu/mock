import { Container } from 'hostConfig'
import { Key, Props, ReactElement, Ref } from 'shared/ReactTypes'
import { Flags, NoFlags } from './fiberFlags'
import { FunctionComponent, HostComponent, WorkTag } from './workTags'

export class FiberNode {
  ref: Ref

  tag: WorkTag
  key: Key
  type: any
  stateNode: any

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  pendingProps: Props
  memoizedProps: Props
  memoizedState: Props
  updateQueue: unknown

  alternate: FiberNode | null

  flags: Flags

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.ref = null

    // ! 实例化
    this.tag = tag
    this.key = key
    // ? 例如 HostComponent <div></div> 则stateNode保存div的DOM，但是为什么hostRootFiber指向fiberRootNode
    this.stateNode = null
    // 例如 FunctionComponent 的函数本身
    this.type = null

    // ! 构成树状结构
    // 指向父FiberNode，return后由下一个工作单元执行，即父FiberNode
    this.return = null
    // 右兄弟FiberNode
    this.sibling = null
    this.child = null
    // 例如 <ul><li><li></ul>，则第一个li的index为0，第二个li为1
    this.index = 0

    // ! 作为工作单元
    // 工作处理前的props
    this.pendingProps = pendingProps
    // 工作处理后的props
    this.memoizedProps = null
    // 更新后的状态
    this.memoizedState = null
    // 更新实例队列
    this.updateQueue = null

    // 指向该fiber在另一双缓存树对应的fiber
    this.alternate = null

    // 副作用
    this.flags = NoFlags
  }
}

export class FiberRootNode {
  container: Container
  current: FiberNode
  finishedWork: FiberNode | null

  constructor(container: Container, hostRootFiber: FiberNode) {
    // ui容器比如DOM的根div
    this.container = container
    // 当前浏览器渲染的fiber树
    this.current = hostRootFiber
    hostRootFiber.stateNode = this
    // 工作完成的hostRootFiber
    this.finishedWork = null
  }
}

/**
 * 创建或更新workInProgress
 */
export function createWorkInProgress(
  current: FiberNode,
  pendingProps: Props
): FiberNode {
  // 获取workInProgress
  let wip = current.alternate

  if (wip === null) {
    // mount
    // 根据current创建workInProgress节点
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode
    current.alternate = wip
  } else {
    // update
    // 更新属性并清除副作用
    wip.pendingProps = pendingProps
    wip.flags = NoFlags
  }
  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState

  return wip
}

/**
 * 根据ReactElement创建FiberNode
 */
export function createFiberFromElement(element: ReactElement): FiberNode {
  const { type, key, props } = element

  let fiberTag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    fiberTag = HostComponent
  } else if (typeof type !== 'function' && __DEV__) {
    console.warn('未定义的type类型', element)
  }

  const fiber = new FiberNode(fiberTag, props, key)

  fiber.type = type

  return fiber
}
