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

export function useReducer<S, I, A>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (initialArg: I) => S,
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher()

  return dispatcher.useReducer(reducer, initialArg, init)
}
