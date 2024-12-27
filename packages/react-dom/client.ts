import { createRoot as createRootImpl } from '.'

export function createRoot(container: Element | DocumentFragment) {
  try {
    return createRootImpl(container)
  } finally {
  }
}
