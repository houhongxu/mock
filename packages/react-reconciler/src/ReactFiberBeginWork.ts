import { mountChildFibers } from './ReactChildFiber'
import { Fiber } from './ReactFiber'
import { FiberRoot } from './ReactFiberRoot'
import { State, processUpdateQueue } from './ReactUpdateQueue'
import { HostComponent, HostRoot } from './ReactWorkTags'

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)!
  } else {
    // workInProgress.child = reconcileChildFibers(
    //   workInProgress,
    //   current.child,
    //   nextChildren,
    // );
  }
}

function updateHostRoot(current: Fiber | null, workInProgress: Fiber) {
  if (current === null) {
    console.error('bug')
  }

  const nextProps = workInProgress.pendingProps
  const prevState = workInProgress.memoizedState as State
  const prevChildren = prevState.element

  // update state
  processUpdateQueue(workInProgress, nextProps)

  const nextState = workInProgress.memoizedState as State
  const root = workInProgress.stateNode as FiberRoot

  const nextChildren = nextState.element

  // 协调子节点
  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress
}

function updateHostComponent() {
  return null
}

export function beginWork(current: Fiber | null, workInProgress: Fiber) {
  // ! update
  console.log('[beginWork]', current, workInProgress)

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
      return updateHostComponent()
  }

  return null
}
