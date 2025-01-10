import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import {
  ReactElement as ReactElementType,
  ElementType,
  Key,
  Props,
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
    _fucntion: 'createElement',
  }
}

export function createElement(
  type: ElementType,
  config: any,
  ...children: any
) {
  const props: Props = {}

  let key: Key = null
  let ref: Ref = null

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

  // 赋值children
  const childrenLength = children.length

  if (childrenLength) {
    if (childrenLength === 1) {
      props.children = children[0]
    } else {
      props.children = children
    }
  }

  return ReactElement(type, key, ref, props)
}
