import { createElement as createElementProd } from './ReactElement'
import { createElementWithValidation } from './ReactElementValidator'
import ReactVersion from 'shared/ReactVersion'

const __DEV__ = true

// 生产环境就是跳过了类型验证
const createElement = __DEV__ ? createElementWithValidation : createElementProd

export { createElement, ReactVersion as version }
