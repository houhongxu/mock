import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
  ElementType,
  Key,
  Props,
  ReactElement as ReactElementType,
  Ref,
  Type,
} from 'shared/ReactTypes'
import hasOwnProperty from 'shared/hasOwnProperty'

const RESERVED_PROPS = {
  key: true,
  ref: true,
}

function hasValidKey(config: any) {
  return config.key !== undefined
}

function hasValidRef(config: any) {
  return config.ref !== undefined
}

function ReactElement(
  type: Type,
  key: Key,
  ref: Ref,
  props: Props,
): ReactElementType {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props,
    _author: 'HHX',
    _fucntion: 'jsxDev',
  }
}

// 目前不区分
export const jsx = jsxDEV

export function jsxDEV(type: ElementType, config: any, maybeKey: any) {
  const props: Props = {}

  let key: Key = null
  let ref: Ref = null

  // 确保key是字符串
  if (maybeKey !== undefined) {
    key = '' + maybeKey
  }

  // 单独处理config.key
  if (hasValidKey(config)) {
    key = '' + config.key
  }

  // 单独处理config.ref
  if (hasValidRef(config)) {
    ref = config.ref
  }

  // 赋值config剩余属性到props
  for (const propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName]
    }
  }

  // 处理默认props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps

    for (const propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
  }

  return ReactElement(type, key, ref, props)
}
