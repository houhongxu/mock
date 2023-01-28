// ReactElement相关类型

export type ElementType = any
export type Type = any
export type Key = any
export type Ref = any
export type Props = any

export interface ReactElement {
  $$typeof: symbol | number
  type: ElementType
  key: Key
  ref: Ref
  props: Props
  __author: string
}

export type Action<State> = State | ((prevState: State) => State)
