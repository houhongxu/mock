import {
  createContainer,
  updateContainer,
} from 'react-reconciler/src/ReactFiberReconciller'
import { FiberRoot } from 'react-reconciler/src/ReactInternalTypes'
import { ReactNodeList } from 'react-shared/ReactTypes'

class ReactDOMRoot {
  private _internalRoot: FiberRoot

  constructor(internalRoot: FiberRoot) {
    this._internalRoot = internalRoot
  }

  render(children: ReactNodeList) {
    const root = this._internalRoot

    updateContainer(children, root)
  }
}

export function createRoot(container: Element | DocumentFragment) {
  const root = createContainer(container)

  return new ReactDOMRoot(root)
}
