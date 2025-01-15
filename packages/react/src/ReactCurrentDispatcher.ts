import type { Dispatcher } from 'react-reconciler/src/ReactInternalTypes'

const ReactCurrentDispatcher: {
  current: null | Dispatcher
} = {
  current: null,
}

export default ReactCurrentDispatcher
