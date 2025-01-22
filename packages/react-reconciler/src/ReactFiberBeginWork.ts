import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { Fiber } from './ReactFiber'
import { Placement } from './ReactFiberFlags'
import { renderWithHooks } from './ReactFiberHooks'
import { FiberRoot } from './ReactFiberRoot'
import { ComponentState } from './ReactInternalTypes'
import { initializeUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from './ReactWorkTags'
import ReactCurrentOwner from 'react/src/ReactCurrentOwner'
import { Props, Type } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
) {
  console.log('(reconcileChildren)', clone(nextChildren))

  // ! 父 -> 子
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)!
  } else {
    // ! mount时，host root fiber也走reconcileChildFibers

    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    )!
  }
}

function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
) {
  // ! ref只有ClassComponent赋值
  ReactCurrentOwner.current = workInProgress

  return workInProgress.child
}

function mountIndeterminateComponent(
  _current: Fiber | null,
  workInProgress: Fiber,
  Component: Type,
) {
  console.log('<mountIndeterminateComponent>')

  if (_current !== null) {
    _current.alternate = null

    workInProgress.alternate = null

    workInProgress.flags |= Placement
  }

  const props = workInProgress.pendingProps
  let value

  value = renderWithHooks(null, workInProgress, Component, props)

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof value.render === 'function' &&
    value.$$typeof === undefined
  ) {
    workInProgress.tag = ClassComponent

    workInProgress.memoizedState = null
    workInProgress.updateQueue = null

    workInProgress.memoizedState =
      value.state !== null && value.state !== undefined ? value.state : null

    initializeUpdateQueue(workInProgress)

    return finishClassComponent(null, workInProgress, Component, true)
  } else {
    // ! mount FuntionComponent

    workInProgress.tag = FunctionComponent

    reconcileChildren(null, workInProgress, value)

    return workInProgress.child
  }
}

function updateHostRoot(current: Fiber | null, workInProgress: Fiber) {
  console.log('<updateHostRoot>')

  if (current === null) {
    throw Error('updateHostRoot')
  }

  const nextProps = workInProgress.pendingProps as ComponentState
  const prevState = workInProgress.memoizedState as ComponentState
  const prevChildren = prevState.element

  // update state
  processUpdateQueue<ComponentState>(workInProgress, nextProps)

  const nextState = workInProgress.memoizedState as ComponentState
  const root = workInProgress.stateNode as FiberRoot

  const nextChildren = nextState.element

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren)

  console.log('<updateHostRoot> finish', clone(workInProgress))

  return workInProgress.child
}

function updateHostComponent(current: Fiber | null, workInProgress: Fiber) {
  console.log('<updateHostComponent>')

  const nextProps = workInProgress.pendingProps
  const nextChildren = nextProps.children

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

function updateFuntionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: Props,
) {
  // ! update FuntionComponent
  console.log('<updateFuntionComponent>')

  let nextChildren

  nextChildren = renderWithHooks(current, workInProgress, Component, nextProps)

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

function updateFragment(current: Fiber | null, workInProgress: Fiber) {
  const nextChildren = workInProgress.pendingProps

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

export function beginWork(current: Fiber | null, workInProgress: Fiber) {
  console.log('(beginWork)', clone(current), clone(workInProgress))

  // ! update

  // bailout 优化
  let didReceiveUpdate = false

  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps

    if (oldProps !== newProps) {
      didReceiveUpdate = true
    } else {
    }
  }

  // ! mount
  switch (workInProgress.tag) {
    // 2
    case IndeterminateComponent:
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
      )
    // 3
    case HostRoot:
      return updateHostRoot(current, workInProgress)

    // 5
    case HostComponent:
      return updateHostComponent(current, workInProgress)

    // 6
    case HostText:
      return null

    // 0
    case FunctionComponent:
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps = unresolvedProps

      return updateFuntionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
      )

    // 7
    case Fragment:
      return updateFragment(current, workInProgress)
  }

  return null
}
