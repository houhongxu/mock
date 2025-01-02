import { FiberRoot, createFiberRoot } from './ReactFiberRoot'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { RootTag } from './ReactRootTags'
import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import { Callback, Container, ReactElement } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

export function createContainer(containerInfo: Container, tag: RootTag) {
  console.log('(createContainer)')

  const root = createFiberRoot(containerInfo, tag)

  console.log('(createFiberRoot) return', clone(root))

  return root
}

export function updateContainer(
  element: ReactElement,
  container: FiberRoot,
  callback?: Callback,
) {
  console.log('(updateContainer)')

  // host root fiber
  const current = container.current

  // const lane = requestUpdateLane(current)

  const update = createUpdate()

  update.payload = { element }

  console.log('(createUpdate) return', clone(update))

  enqueueUpdate(current, update)

  console.log('(enqueueUpdate) queue', clone(current.updateQueue))

  const root = scheduleUpdateOnFiber(current)

  // return lane
}
