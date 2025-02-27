import { Fiber, createHostRootFiber } from './ReactFiber'
import { ComponentState } from './ReactInternalTypes'
import { RootTag } from './ReactRootTags'
import { initializeUpdateQueue } from './ReactUpdateQueue'
import { Container } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

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
  console.log('(createFiberRoot)')

  const uninitializedFiber = createHostRootFiber(tag)

  console.log('(createHostRootFiber) return', clone(uninitializedFiber))

  const root = new FiberRoot(containerInfo, tag, uninitializedFiber)

  // root.current = uninitializedFiber 因为必然赋值，所以直接通过参数赋值了

  uninitializedFiber.stateNode = root

  const initialState: ComponentState = {
    element: null,
  }

  uninitializedFiber.memoizedState = initialState

  initializeUpdateQueue<ComponentState>(uninitializedFiber)

  return root
}
