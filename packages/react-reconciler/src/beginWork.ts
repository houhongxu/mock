// 递归中的递阶段

import { FiberNode } from './fiber'

/**
 * 开始工作
 */
export function beginWork(fiber: FiberNode) {
  // 比较ReactElement与FiberNode，返回子FiberNode
  return new FiberNode(0, null, null)
}
