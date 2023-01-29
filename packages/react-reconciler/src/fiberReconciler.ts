import { Container } from 'hostConfig'
import { ReactElement } from 'shared/ReactTypes'
import { FiberNode, FiberRootNode } from './fiber'
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'
import { HostRoot } from './workTags'

/**
 * 创建fiberRootNode
 * @description 在ReactDOM.createRoot()中执行
 */
export function createContainer(container: Container) {
  // 初始化hostRootFiber
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  // 初始化fiberRootNode
  const root = new FiberRootNode(container, hostRootFiber)
  // 初始化hostRootFiber的更新实例队列
  hostRootFiber.updateQueue = createUpdateQueue()
  return root
}

/**
 * 更新fiberRootNode
 * @description 在ReactDOM.createRoot().render()中执行
 */
export function updateContainer(
  element: ReactElement | null,
  root: FiberRootNode
) {
  // 获取hostRootFiber-current
  const hostRootFiber = root.current
  // 创建更新实例
  const update = createUpdate<ReactElement | null>(element)
  // 插入到更新实例队列中
  enqueueUpdate(
    hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
    update
  )
  // fiber可以开始调度上方的更新
  scheduleUpdateOnFiber(hostRootFiber)
  return element
}
