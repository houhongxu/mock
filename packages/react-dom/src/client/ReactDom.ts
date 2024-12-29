import { render } from './ReactDOMLegacy'
import { createRoot as createRootImpl } from './ReactDOMRoot'
import { Container } from 'shared/ReactTypes'

function createRoot(container: Container) {
  return createRootImpl(container)
}

export { render, createRoot }
