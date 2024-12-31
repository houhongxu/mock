import { FiberRootNode, createFiberRoot } from './ReactFiberRoot'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { RootTag } from './ReactRootTags'
import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import { Callback, Container, ReactElement } from 'shared/ReactTypes'

export function createContainer(containerInfo: Container, tag: RootTag) {
  console.log('[createContainer]')

  return createFiberRoot(containerInfo, tag)
}

export function updateContainer(
  element: ReactElement,
  container: FiberRootNode,
  callback?: Callback,
) {
  console.log('[updateContainer]')

  // host root fiber
  const current = container.current

  // const lane = requestUpdateLane(current)

  const update = createUpdate()

  enqueueUpdate(current, update)

  const root = scheduleUpdateOnFiber(current)

  // return lane
}
