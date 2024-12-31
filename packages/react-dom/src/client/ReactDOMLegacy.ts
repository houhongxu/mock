import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/ReactFiberReconciller'
import { FiberRoot } from 'react-reconciler/src/ReactFiberRoot'
import { LegacyRoot } from 'react-reconciler/src/ReactRootTags'
import { Callback, Container, ReactElement } from 'shared/ReactTypes'

function legacyCreateRootFromDOMContainer(
  container: Container & { _reactRootContainer?: FiberRoot },
  initialChildren: ReactElement,
  callback?: Callback,
) {
  // 首先使用dom的api清空子dom
  let rootSibling

  while ((rootSibling = container.lastChild)) {
    container.removeChild(rootSibling)
  }

  // 创建fiber root
  const root = createContainer(container, LegacyRoot)

  // container内部属性指向fiber root
  container._reactRootContainer = root

  updateContainer(initialChildren, root, callback)

  return root
}

function legacyRenderSubtreeIntoContainer(
  children: ReactElement,
  container: Container & { _reactRootContainer?: FiberRoot },
  callback?: Callback,
) {
  // 可能的根节点，防止重复渲染
  const maybeRoot = container._reactRootContainer

  let root: FiberRoot

  if (!maybeRoot) {
    root = legacyCreateRootFromDOMContainer(container, children, callback)
  } else {
    root = maybeRoot

    updateContainer(children, root, callback)
  }
}

export function render(
  element: ReactElement,
  container: Container & { _reactRootContainer?: FiberRoot },
  callback?: Callback,
) {
  return legacyRenderSubtreeIntoContainer(element, container, callback)
}
