import { FiberRootNode, createFiberRoot } from './ReactFiberRoot'
import { RootTag } from './ReactRootTags'
import { Callback, Container, ReactElement } from 'shared/ReactTypes'

export function createContainer(containerInfo: Container, tag: RootTag) {
  return createFiberRoot(containerInfo, tag)
}

export function updateContainer(
  element: ReactElement,
  root: FiberRootNode,
  callback?: Callback,
) {
  return {}
}
