import ReactCurrentDispatcher from './ReactCurrentDispatcher'
import { Dispatch } from 'react-reconciler/src/ReactInternalTypes'

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current

  if (dispatcher === null) {
    throw new Error('resolveDispatcher')
  }

  return dispatcher
}

export function useState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
  const dispatcher = resolveDispatcher()

  return dispatcher.useState(initialState)
}
