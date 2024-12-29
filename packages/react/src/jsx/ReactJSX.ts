import { jsx as jsxProd } from './ReactJSXElement'
import {
  jsxWithValidation,
  jsxWithValidationDynamic,
} from './ReactJSXElementValidator'

const __DEV__ = true

// 目前两者相同
const jsx = __DEV__ ? jsxWithValidationDynamic : jsxProd
const jsxDEV = __DEV__ ? jsxWithValidation : undefined

export { jsxDEV, jsx }
