import { ReactElement } from 'shared/ReactTypes'

export type ComponentState = {
  element: ReactElement | null
}

export type BasicStateAction<State> = State | ((prevState: State) => State)

export type Dispatch<State> = (action: BasicStateAction<State>) => void

export type HookType =
  | 'useState'
  | 'useReducer'
  | 'useContext'
  | 'useRef'
  | 'useEffect'
  | 'useInsertionEffect'
  | 'useLayoutEffect'
  | 'useCallback'
  | 'useMemo'
  | 'useImperativeHandle'
  | 'useDebugValue'
  | 'useDeferredValue'
  | 'useTransition'
  | 'useMutableSource'
  | 'useSyncExternalStore'
  | 'useId'
  | 'useCacheRefresh'

export interface Dispatcher {
  useState<S>(initialState: (() => S) | S): [S, Dispatch<S>]

  useReducer<S, I, A>(
    reducer: (state: S, action: A) => S,
    initialArg: I,
    init?: (initialArg: I) => S,
  ): [S, Dispatch<A>]
}
