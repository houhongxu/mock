// beginWork性能优化，仅对根节点进行插入dom

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement } from 'shared/ReactTypes'
import { createFiberFromElement, FiberNode } from './fiber'
import { Placement } from './fiberFlags'
import { HostText } from './workTags'

/**
 * mount时优化
 */
function ChildReconciler(sholdTrackEffects: boolean) {
  /**
   * 单节点
   */
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElement
  ) {
    const fiber = createFiberFromElement(element)
    fiber.return = returnFiber
    return fiber
  }

  /**
   * 文本节点
   */
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    const fiber = new FiberNode(HostText, { content }, null)
    fiber.return = returnFiber
    return fiber
  }

  function placeSingleChild(fiber: FiberNode) {
    // 追踪且首屏渲染
    if (sholdTrackEffects && fiber.alternate === null) {
      // ! mount
      fiber.flags |= Placement
    }

    return fiber
  }

  return function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElement
  ) {
    // ! 单节点
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFiber, newChild)
          )

        default:
          if (__DEV__) {
            console.warn('未实现的reconcile类型', newChild)
          }
          break
      }
    }

    // TODO 多节点情况 ul>li*3

    // ! 文本节点
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFiber, newChild)
      )
    }

    if (__DEV__) {
      console.warn('未实现的reconcile类型', newChild)
    }

    return null
  }
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)
