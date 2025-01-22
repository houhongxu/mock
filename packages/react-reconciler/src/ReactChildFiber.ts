import {
  Fiber,
  createFiberFromElement,
  createFiberFromFragment,
  createFiberFromText,
  createWorkInProgress,
} from './ReactFiber'
import { ChildDeletion, Placement } from './ReactFiberFlags'
import { Fragment, HostText } from './ReactWorkTags'
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols'
import { ReactElement } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

function coerceRef(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
) {
  console.log('coerceRef', clone(element._owner))

  const mixedRef = element.ref

  if (
    mixedRef !== null &&
    typeof mixedRef !== 'function' &&
    typeof mixedRef !== 'object'
  ) {
    // ! 仅ClassComponent
    if (element._owner) {
    } else {
    }
  }

  return mixedRef
}

// 协调子节点，参数为是否收集副作用
function ChildReconciler(shouldTrackSideEffects: boolean) {
  function deleteChild(returnFiber: Fiber, childToDelete: Fiber) {
    const deletions = returnFiber.deletions

    if (deletions === null) {
      returnFiber.deletions = [childToDelete]

      returnFiber.flags |= ChildDeletion
    } else {
      deletions.push(childToDelete)
    }
  }

  function deleteRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
  ) {
    if (!shouldTrackSideEffects) {
      return null
    }

    let childToDelete = currentFirstChild

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)

      childToDelete = childToDelete.sibling
    }

    return null
  }

  // 复用fiber
  function useFiber(fiber: Fiber, pendingProps: any): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps)

    clone.index = 0
    clone.sibling = null

    return clone
  }

  // 插入单fiber
  function placeSingleChild(newFiber: Fiber) {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      // ! update
      newFiber.flags |= Placement
    }

    // ! mount
    return newFiber
  }

  // child react element to fiber
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
  ) {
    const key = element.key
    let child = currentFirstChild

    // ! update
    while (child !== null) {
      if (child.key === key) {
        const elementType = element.type

        if (elementType === REACT_FRAGMENT_TYPE) {
          if (child.tag === Fragment) {
            deleteRemainingChildren(returnFiber, child.sibling)

            const existing = useFiber(child, element.props.children)

            existing.return = returnFiber

            return existing
          }
        } else if (child.elementType === elementType) {
          // key type 相同则复用fiber
          deleteRemainingChildren(returnFiber, child.sibling)

          const existing = useFiber(child, element.props)

          existing.ref = coerceRef(returnFiber, child, element)

          existing.return = returnFiber

          return existing
        }
      } else {
        deleteChild(returnFiber, child)
      }

      child = child.sibling
    }

    // ! mount
    if (element.type === REACT_FRAGMENT_TYPE) {
      const created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        element.key,
      )

      created.return = returnFiber

      return created
    } else {
      const created = createFiberFromElement(element, returnFiber.mode)

      created.ref = coerceRef(returnFiber, currentFirstChild, element)

      // ! 子 -> 父
      created.return = returnFiber

      return created
    }
  }

  function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
  ) {
    // ! update
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling)

      const existing = useFiber(currentFirstChild, textContent)

      existing.return = returnFiber

      return existing
    }

    // ! mount
    deleteRemainingChildren(returnFiber, currentFirstChild)

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
      shouldTrackSideEffects ? 'update' : 'mount',
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

    if (currentFirstChild !== null) {
      deleteRemainingChildren(returnFiber, currentFirstChild)
    }
  }

  return reconcileChildFibers
}

// ! update，收集副作用
export const reconcileChildFibers = ChildReconciler(true)

// ! mount，不收集副作用
export const mountChildFibers = ChildReconciler(false)
