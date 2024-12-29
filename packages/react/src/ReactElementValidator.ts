import { createElement } from './ReactElement'
import { ElementType, Props } from 'shared/ReactTypes'

export function createElementWithValidation(
  this: any,
  type: ElementType,
  props: Props,
  ...children: any
) {
  return createElement.apply(this, [type, props, ...children])
}
