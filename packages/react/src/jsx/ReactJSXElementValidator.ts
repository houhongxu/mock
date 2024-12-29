import { jsxDEV } from './ReactJSXElement'
import { ElementType, Key, Props } from 'shared/ReactTypes'

export function jsxWithValidation(type: ElementType, props: Props, key: Key) {
  return jsxDEV(type, props, key)
}

// 目前不区分
export const jsxWithValidationDynamic = jsxWithValidation
