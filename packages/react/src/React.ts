import { createElement as createElementProd } from './ReactElement'
import { createElementWithValidation } from './ReactElementValidator'
import { useState } from './ReactHooks'
import ReactSharedInternals from './ReactSharedInternals'
import ReactVersion from 'shared/ReactVersion'

const __DEV__ = true

// 生产环境就是跳过了类型验证
const createElement = __DEV__ ? createElementWithValidation : createElementProd

export {
  useState,
  createElement,
  ReactVersion as version,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
}
