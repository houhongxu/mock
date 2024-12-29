import { FiberNode, createHostRootFiber } from './ReactFiber'
import { RootTag } from './ReactRootTags'
import { Container } from 'shared/ReactTypes'

export class FiberRootNode {
  containerInfo: Container
  tag: RootTag
  current: FiberNode | null
  finishedWork: FiberNode | null

  constructor(containerInfo: Container, tag: RootTag) {
    this.containerInfo = containerInfo
    this.tag = tag

    this.current = null
    this.finishedWork = null
  }
}

export function createFiberRoot(containerInfo: Container, tag: RootTag) {
  const root = new FiberRootNode(containerInfo, tag)

  const uninitializedFiber = createHostRootFiber(tag)

  root.current = uninitializedFiber

  uninitializedFiber.stateNode = root

  // uninitializedFiber.memoizedState = initialState;

  // initializeUpdateQueue(uninitializedFiber);

  return root
}
