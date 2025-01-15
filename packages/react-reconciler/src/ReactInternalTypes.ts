export type Action<State> = State | ((prevState: State) => State)

export type Dispatch<State> = (action: Action<State>) => void

export interface Dispatcher {
  useState: <S>(initialState: () => S | S) => [S, Dispatch<S>]
}
