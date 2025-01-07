export type ElementType = any
export type Type = any
export type Key = string | null
export type Ref = any
export type Props = any
export type Container = Element | DocumentFragment
export type Callback = null | (() => void)
export type Instance = Element
export interface ReactElement {
  $$typeof?: symbol | number
  type: ElementType
  key: Key
  props: Props
  ref?: Ref
  _author?: string
}
