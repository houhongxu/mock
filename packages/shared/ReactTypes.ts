export interface ReactNodeList {}

export type ElementType = any
export type Type = any
export type Key = string | null
export type Ref = any
export type Props = any

export interface ReactElement {
  $$typeof: symbol | number
  type: ElementType
  key: Key
  props: Props
  ref: Ref
  _author: string
}
