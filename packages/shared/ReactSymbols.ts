// 定义 ReactElement标识属性类型，为了防止ReactElement被滥用，定义为唯一值

const supportSymbol = typeof Symbol === 'function' && Symbol.for

export const REACT_ELEMENT_TYPE = supportSymbol
  ? Symbol.for('react.element')
  : 0xeac7 // Dan说 用0xeac7 是因为看起来像React
