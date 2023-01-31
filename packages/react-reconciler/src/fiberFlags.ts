export type Flags = number

export const NoFlags = 0b00000000

// 处理结构
export const Placement = 0b00000010
export const ChildDelection = 0b00001000

// 处理属性
export const Update = 0b00000100

// mutation节点需要执行的操作
export const MutationMask = Placement | ChildDelection | Update
