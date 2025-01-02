// ! beginWork性能优化
// ! mount时仅对根节点进行副作用标记，则插入离屏DOM时整树插入

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { Props, ReactElement } from 'shared/ReactTypes'
import {
  createFiberFromElement,
  createWorkInProgress,
  FiberNode
} from './fiber'
import { ChildDeletion, Placement } from './fiberFlags'
import { HostText } from './workTags'

/**
 * !!! 协调子fiberNode-current与子ReactElement，返回协调好的fiberNode-workInProgress
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
    // TODO 元素位置移动
    // ! update，复用fiberNode-current
    const key = element.key
    work: if (currentFiber !== null) {
      if (currentFiber.key === key) {
        if (element.$$typeof === REACT_ELEMENT_TYPE) {
          if (currentFiber.type === element.type) {
            // 复用
            const existing = useFiber(currentFiber, element.props)
            // 建立父子关系
            existing.return = returnFiber
            return existing
          }
          // 删除旧fiberNode 因为type不同
          deleteChild(returnFiber, currentFiber)
          break work
        } else {
          if (__DEV__) {
            console.warn('还未实现的react类型', element)
            break work
          }
        }
      } else {
        // 删除旧fiberNode，因为key不同
        deleteChild(returnFiber, currentFiber)
      }
    }

    // ! mount，创建fiberNode
    // 获取根据ReactElement创建的fiberNode
    const fiber = createFiberFromElement(element)
    // 建立父子关系
    fiber.return = returnFiber

    return fiber
  }

  /**
   * !!! 协调文本节点
   * @desciption 根据文本内容创建fiberNode并连接父节点
   */
  function reconcileSingleTextNode(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    content: string | number
  ) {
    // ! update
    if (currentFiber !== null) {
      if (currentFiber.tag === HostText) {
        // 复用
        const existing = useFiber(currentFiber, { content })
        // 建立父子关系
        existing.return = returnFiber
        return existing
      }
      deleteChild(returnFiber, currentFiber)
    }

    // ! mount
    // 获取根据文本内容创建的fiberNode
    const fiber = new FiberNode(HostText, { content }, null)
    // 连接父fiberNode
    fiber.return = returnFiber

    return fiber
  }

  /**
   * 记录需要删除的子fiberNode
   */
  function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
    if (!shouldTrackEffects) {
      return
    }

    const delections = returnFiber.deletions

    if (delections === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    } else {
      delections.push(childToDelete)
    }
  }

  /**
   * 复用current
   */
  function useFiber(fiber: FiberNode, pendingProps: Props): FiberNode {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  /**
   * ! mount插入单一节点，仅hostRootFiber追踪副作用，性能优化
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

  /**
   * 协调新ReactElement与旧fiberNode
   */
  function reconcileChildFibers(
    returnFiber: FiberNode,
    currentFiber: FiberNode | null,
    newChild?: ReactElement
  ) {
    console.log('(reconcileChildFibers)', newChild)

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

    if (currentFiber !== null) {
      // ! 兜底则删除
      deleteChild(returnFiber, currentFiber)
    }

    if (__DEV__) {
      console.warn('未实现的reconcile类型', newChild)
    }

    return null
  }

  return reconcileChildFibers
}
export const reconcileChildFibers = ChildReconciler(true)
// ! mount时除hostRootFiber以外的fiberNode都不追踪副作用
export const mountChildFibers = ChildReconciler(false)
