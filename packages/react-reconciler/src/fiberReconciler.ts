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
 * 创建fiberRootNode与hostRootFiber-current
 * @description 在ReactDOM.createRoot(container)中执行
 */
export function createContainer(container: Container) {
  // 初始化hostRootFiber-current，此处打上了HostRoot的tag
  const hostRootFiber = new FiberNode(HostRoot, {}, null)
  // 初始化fiberRootNode
  const root = new FiberRootNode(container, hostRootFiber)
  // 初始化hostRootFiber的更新实例队列
  hostRootFiber.updateQueue = createUpdateQueue()

  console.log('(createContainer)', root)

  return root
}

/**
 * 更新fiberRootNode
 * @description 在ReactDOM.createRoot(container).render(<App/>)中执行
 */
export function updateContainer(
  element: ReactElement | null,
  root: FiberRootNode
) {
  console.log('(updateContainer)')

  // 获取hostRootFiber-current
  const hostRootFiber = root.current
  // ! 创建react根组件更新实例用来更新react根组件，更新实例可以是ReactElement，因为会根据ReactElement生成fiberNode进行更新
  const update = createUpdate<ReactElement | null>(element)

  // 插入到更新实例队列中
  enqueueUpdate(
    hostRootFiber.updateQueue as UpdateQueue<ReactElement | null>,
    update
  )
  // 开始从hostRootFiber调度更新
  scheduleUpdateOnFiber(hostRootFiber)
  return element
}
