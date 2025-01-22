import { createRoot as createRootImpl } from '.'

export function createRoot(container: Element) {
  try {
    return createRootImpl(container)
  } finally {
  }
}
