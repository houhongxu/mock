import ReactCurrentDispatcher from './ReactCurrentDispatcher'
import ReactCurrentOwner from './ReactCurrentOwner'
import { clone } from 'shared/clone'

const ReactSharedInternals = {
  ReactCurrentDispatcher,
  ReactCurrentOwner,
}

console.log('ReactSharedInternals', clone(ReactSharedInternals))

export default ReactSharedInternals
