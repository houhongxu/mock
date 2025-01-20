import type { Dispatcher } from 'react-reconciler/src/ReactInternalTypes'
import { clone } from 'shared/clone'

const ReactCurrentDispatcher: {
  current: null | Dispatcher
} = {
  current: null,
}

export default ReactCurrentDispatcher
