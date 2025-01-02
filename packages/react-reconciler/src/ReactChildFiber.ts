import {
  Fiber,
  createFiberFromElement,
  createFiberFromText,
} from './ReactFiber'
import { Placement } from './ReactFiberFlags'
import { HostText } from './ReactWorkTags'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

// 协调子节点，参数为是否收集副作用
function ChildReconciler(shouldTrackSideEffects: boolean) {
  // 插入单节点
  function placeSingleChild(newFiber: Fiber) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // update
      newFiber.flags |= Placement
    }

    // mount
    return newFiber
  }

  // react element to fiber
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
  ) {
    const key = element.key
    let child = currentFirstChild

    // update
    while (child !== null) {
      break
    }

    // mount
    const fiber = createFiberFromElement(element, returnFiber.mode)
    // ! 子 -> 父
    fiber.return = returnFiber

    return fiber
  }

  function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
  ) {
    // update
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
    }

    const created = createFiberFromText(textContent, returnFiber.mode)
    created.return = returnFiber

    return created
  }

  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
  ) {
    console.log(
      '(reconcileChildFibers)',
      shouldTrackSideEffects,
      clone(newChild),
    )

    // ! 单节点
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild),
          )
      }
    }

    // ! 文本节点
    if (
      (typeof newChild === 'string' && newChild !== '') ||
      typeof newChild === 'number'
    ) {
      return placeSingleChild(
        reconcileSingleTextNode(returnFiber, currentFirstChild, '' + newChild),
      )
    }

    // if (currentFirstChild !== null) {
    //   deleteRemainingChildren(returnFiber, currentFirstChild)
    // }
  }

  return reconcileChildFibers
}

// update，收集副作用
export const reconcileChildFibers = ChildReconciler(true)

// mount，不收集副作用
export const mountChildFibers = ChildReconciler(false)
