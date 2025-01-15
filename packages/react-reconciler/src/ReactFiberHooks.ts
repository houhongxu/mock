import { Fiber } from './ReactFiber'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { Action, Dispatch, Dispatcher } from './ReactInternalTypes'
import ReactSharedInternals from 'shared/ReactSharedInternals'
import { Props } from 'shared/ReactTypes'

type Update<S, A> = {
  action: A
  next: Update<S, A> | null
}

export type Hook = {
  memoizedState: any

  baseState: any
  baseQueue: Update<any, any> | null

  queue: any
  next: Hook | null
}

export type UpdateQueue<S, A> = {
  pending: Update<S, A> | null
  dispatch: any
}

const { ReactCurrentDispatcher } = ReactSharedInternals

let currentlyRenderingFiber: Fiber | null = null
let currentHook: Hook | null = null
let workInProgressHook: Hook | null = null

function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  }

  if (workInProgressHook === null) {
    // 当前hook初始化为链表头
    currentlyRenderingFiber!.memoizedState = workInProgressHook = hook
  } else {
    // 当前hook插入链表尾
    workInProgressHook = workInProgressHook.next = hook
  }

  return workInProgressHook
}

function enqueueUpdate<S, A>(queue: UpdateQueue<S, A>, update: Update<S, A>) {
  const pending = queue.pending

  if (pending === null) {
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }

  queue.pending = update
}

function dispatchSetState<S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A,
) {
  const update: Update<S, A> = {
    action,
    next: null,
  }

  enqueueUpdate(queue, update)

  const root = scheduleUpdateOnFiber(fiber)
}

function mountState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
  const hook = mountWorkInProgressHook()

  if (typeof initialState === 'function') {
    initialState = (initialState as () => S)()
  }

  hook.memoizedState = hook.baseState = initialState

  const queue: UpdateQueue<S, Action<S>> = {
    pending: null,
    dispatch: null,
  }

  hook.queue = queue

  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber!,
    queue,
  ))

  return [hook.memoizedState, dispatch]
}

function updateState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
  return [] as any
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
}

export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props) => any,
  props: Props,
) {
  let currentlyRenderingFiber: Fiber | null = workInProgress

  workInProgress.memoizedState = null
  workInProgress.updateQueue = null

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate

  // ! 执行Component触发ReactCurrentDispatcher.current
  let children = Component(props)

  currentlyRenderingFiber = null

  currentHook = null
  workInProgressHook = null

  return children
}
