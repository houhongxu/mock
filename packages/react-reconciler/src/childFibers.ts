// ! beginWork性能优化
// mount时仅对根节点进行副作用标记，则插入离屏DOM时整树插入

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement } from 'shared/ReactTypes'
import { createFiberFromElement, FiberNode } from './fiber'
import { Placement } from './fiberFlags'
import { HostText } from './workTags'

/**
 * 协调子fiberNode-current与子ReactElement，返回协调好的fiberNode-workInProgress
 * @param shouldTrackEffects 是否标记副作用，是则进行falgs的标记，否就不进行falgs的标记
 * @description 当mount时，shouldTrackEffects设置为false可以只对根节点副作用标记
 */
function ChildReconciler(shouldTrackEffects: boolean) {
  /**
   * 协调单节点
   * @desciption 根据ReactElement创建fiberNode并连接父节点
   */
  function reconcileSingleElement(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    element: ReactElement
  ) {
    // 获取根据ReactElement创建的fiberNode
    const fiber = createFiberFromElement(element)
    // 建立父子关系
    fiber.return = returnFiber

    return fiber
  }

  /**
   * 协调文本节点
   * @desciption 根据文本内容创建fiberNode并连接父节点
   */
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    // 获取根据文本内容创建的fiberNode
    const fiber = new FiberNode(HostText, { content }, null)
    // 连接父fiberNode
    fiber.return = returnFiber

    return fiber
  }

  /**
   * 插入单一节点
   * @desciption 插入节点前进行判断是否追踪副作用
   */
  function placeSingleChild(fiber: FiberNode) {
    // ! mount
    // 设置应该追踪副作用且mount时
    if (shouldTrackEffects && fiber.alternate === null) {
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

    // TODO 多节点情况 ul>li*3 Array

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
