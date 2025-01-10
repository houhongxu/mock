export type ElementType = any
export type Type = any
export type Key = string | null
export type Ref = any
export type Props = any
export type Container = Element
export type Callback = null | (() => void)
export type Instance = Element
export type TextInstance = Text

export interface ReactElement {
  $$typeof?: symbol | number
  type: ElementType
  key: Key
  props: Props
  ref?: Ref
  _author?: string
  _fucntion?: string
}
