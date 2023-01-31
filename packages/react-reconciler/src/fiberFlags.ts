export type Flags = number

export const NoFlags = 0b00000000000000000000000000

// 处理结构
export const Placement = 0b00000000000000000000000010
export const ChildDeletion = 0b00000000000000000000010000

// 处理属性
export const Update = 0b00000000000000000000000100

// mutation节点需要执行的操作
export const MutationMask = Placement | ChildDeletion | Update
