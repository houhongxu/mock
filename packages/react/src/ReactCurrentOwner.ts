import { Fiber } from 'react-reconciler/src/ReactFiber'
import { clone } from 'shared/clone'

const ReactCurrentOwner: { current: Fiber | null } = {
  current: null,
}

export default ReactCurrentOwner
