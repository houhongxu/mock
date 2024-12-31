import { Fiber, createHostRootFiber } from './ReactFiber'
import { RootTag } from './ReactRootTags'
import { Container } from 'shared/ReactTypes'

export class FiberRoot {
  containerInfo: Container
  tag: RootTag
  current: Fiber
  finishedWork: Fiber | null

  constructor(containerInfo: Container, tag: RootTag, current: Fiber) {
    this.containerInfo = containerInfo
    this.tag = tag

    this.current = current
    this.finishedWork = null
  }
}

export function createFiberRoot(containerInfo: Container, tag: RootTag) {
  console.log('[createFiberRoot]')

  const uninitializedFiber = createHostRootFiber(tag)

  const root = new FiberRoot(containerInfo, tag, uninitializedFiber)

  // root.current = uninitializedFiber 因为必然赋值，所以直接通过参数赋值了

  uninitializedFiber.stateNode = root

  // uninitializedFiber.memoizedState = initialState;

  // initializeUpdateQueue(uninitializedFiber);

  return root
}
