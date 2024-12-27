import { createRoot as createRootImpl } from './ReactDOMRoot'

export function createRoot(container: Element | DocumentFragment) {
  return createRootImpl(container)
}
