import { Fiber } from 'react-reconciler/src/ReactFiber'

const ReactCurrentOwner: { current: Fiber | null } = {
  current: null,
}

export default ReactCurrentOwner
