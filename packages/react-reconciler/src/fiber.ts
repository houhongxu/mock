import { Container } from 'hostConfig'
import { Key, Props, ReactElement, Ref } from 'shared/ReactTypes'
import { Flags, NoFlags } from './fiberFlags'
import { FunctionComponent, HostComponent, WorkTag } from './workTags'

export class FiberNode {
  ref: Ref

  /**
   * fiberNode类型
   */
  tag: WorkTag
  key: Key
  /**
   * DOM类型，例如 <div/> 的type是'div'，FunctionComponent 是函数本身
   */
  type: any
  /**
   * 对应DOM节点，HostComponent对应DOM节点，例如 HostComponent <div></div> 则stateNode指向div的DOM，而HostRoot因为没有对应的DOM,对应的DOM在fiberRootNode.container，所以指向fiberRootNode
   */
  stateNode: any

  /**
   * 指向父fiberNode
   */
  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  /**
   * 兄弟fiberNode的索引，例如 <ul><li><li></ul>，则第一个li的index为0，第二个li为1
   */
  index: number

  /**
   * 工作处理前的props，此props就是react的数据流
   */
  pendingProps: Props
  /**
   * 工作处理后的props
   */
  memoizedProps: Props
  /**
   * 更新前后的状态
   */
  memoizedState: Props
  /**
   * 更新实例队列
   */
  updateQueue: unknown

  /**
   * 指向该fiberNode在另一双缓存树对应的fiberNode
   */
  alternate: FiberNode | null

  /**
   * 副作用
   */
  flags: Flags
  /**
   * 子树的副作用
   */
  subtreeFlags: Flags

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    this.ref = null

    // ! 实例化
    this.tag = tag
    this.key = key
    this.stateNode = null
    this.type = null

    // ! 构成树状结构
    this.return = null
    this.sibling = null
    this.child = null
    this.index = 0

    // ! 作为工作单元
    this.pendingProps = pendingProps
    this.memoizedProps = null
    this.memoizedState = null
    this.updateQueue = null

    // ! 双缓存
    this.alternate = null

    // ! 副作用
    this.flags = NoFlags
    this.subtreeFlags = NoFlags
  }
}

export class FiberRootNode {
  /**
   * ui容器，比如<div id='root'/>
   */
  container: Container
  /**
   * 当前浏览器渲染的fiberNode
   */
  current: FiberNode
  /**
   * 工作完成的hostRootFiber
   */
  finishedWork: FiberNode | null

  constructor(container: Container, hostRootFiber: FiberNode) {
    this.container = container
    this.current = hostRootFiber

    // hostRootFiber指向fiberRootNode
    hostRootFiber.stateNode = this

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
    // ! mount
    // 根据current创建workInProgress节点
    wip = new FiberNode(current.tag, pendingProps, current.key)
    wip.stateNode = current.stateNode
    // 双缓存
    wip.alternate = current
    current.alternate = wip
  } else {
    // ! update
    // 更新属性并清除副作用
    wip.pendingProps = pendingProps
    wip.flags = NoFlags
    wip.subtreeFlags = NoFlags
  }
  wip.type = current.type
  wip.updateQueue = current.updateQueue
  wip.child = current.child
  wip.memoizedProps = current.memoizedProps
  wip.memoizedState = current.memoizedState

  return wip
}

/**
 * 根据ReactElement创建fiberNode
 */
export function createFiberFromElement(element: ReactElement): FiberNode {
  const { type, key, props } = element

  // 默认的fiberTag
  let fiberTag: WorkTag = FunctionComponent

  if (typeof type === 'string') {
    // 例如 <div/> 的type是'div'
    fiberTag = HostComponent
  } else if (typeof type !== 'function' && __DEV__) {
    console.warn('未定义的type类型', element)
  }

  // 创建fiberNode
  const fiber = new FiberNode(fiberTag, props, key)

  // 记录DOM类型
  fiber.type = type

  return fiber
}
