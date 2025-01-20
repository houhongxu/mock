import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { Fiber } from './ReactFiber'
import { renderWithHooks } from './ReactFiberHooks'
import { FiberRoot } from './ReactFiberRoot'
import { ComponentState } from './ReactInternalTypes'
import { processUpdateQueue } from './ReactUpdateQueue'
import {
  Fragment,
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './ReactWorkTags'
import { Props } from 'shared/ReactTypes'
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
