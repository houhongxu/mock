import { FiberNode, createHostRootFiber } from './ReactFiber'
import { RootTag } from './ReactRootTags'
import { Container } from 'shared/ReactTypes'

export class FiberRootNode {
  containerInfo: Container
  tag: RootTag
  current: FiberNode
  finishedWork: FiberNode | null

  constructor(containerInfo: Container, tag: RootTag, current: FiberNode) {
    this.containerInfo = containerInfo
    this.tag = tag

    this.current = current
    this.finishedWork = null
  }
}

export function createFiberRoot(containerInfo: Container, tag: RootTag) {
  const uninitializedFiber = createHostRootFiber(tag)

  const root = new FiberRootNode(containerInfo, tag, uninitializedFiber)

  // root.current = uninitializedFiber 因为必然赋值，所以直接通过参数赋值了

  uninitializedFiber.stateNode = root

  // uninitializedFiber.memoizedState = initialState;

  // initializeUpdateQueue(uninitializedFiber);

  return root
}
