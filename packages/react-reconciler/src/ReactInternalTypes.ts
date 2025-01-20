import { ReactElement } from 'shared/ReactTypes'

export type ComponentState = {
  element: ReactElement | null
}

export type BasicStateAction<State> = State | ((prevState: State) => State)

export type Dispatch<State> = (action: BasicStateAction<State>) => void

export interface Dispatcher {
  useState: <S>(initialState: (() => S) | S) => [S, Dispatch<S>]
}
