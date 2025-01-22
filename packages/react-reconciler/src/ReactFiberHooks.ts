import { Fiber } from './ReactFiber'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { BasicStateAction, Dispatch, Dispatcher } from './ReactInternalTypes'
import ReactSharedInternals from 'shared/ReactSharedInternals'
import { Props } from 'shared/ReactTypes'
import { clone } from 'shared/clone'

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
  lastRenderedReducer: ((state: S, action: A) => S) | null
  lastRenderedState: S | null
}

const { ReactCurrentDispatcher } = ReactSharedInternals

let currentlyRenderingFiber: Fiber | null = null
let currentHook: Hook | null = null
let workInProgressHook: Hook | null = null

function mountWorkInProgressHook(): Hook {
  console.log('-mountWorkInProgressHook-')

  const hook: Hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  }

  if (workInProgressHook === null) {
    if (currentlyRenderingFiber === null) {
      throw Error('mountWorkInProgressHook')
    }

    // 当前hook初始化为链表头
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    // 当前hook插入链表尾
    workInProgressHook = workInProgressHook.next = hook
  }

  return workInProgressHook
}

function updateWorkInProgressHook() {
  // 获取 nextCurrentHook
  let nextCurrentHook: null | Hook

  if (!currentlyRenderingFiber) {
    throw Error('updateWorkInProgressHook')
  }

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate

    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      nextCurrentHook = null
    }
  } else {
    nextCurrentHook = currentHook.next
  }

  // 获取 nextWorkInProgressHook
  let nextWorkInProgressHook: null | Hook

  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState
  } else {
    nextWorkInProgressHook = workInProgressHook.next
  }

  if (nextWorkInProgressHook !== null) {
    // 下一个workInProgressHook指向nextWorkInProgressHook

    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next

    currentHook = nextCurrentHook
  } else {
    // newHook从currentHook复用
    if (nextCurrentHook === null) {
      throw new Error('updateWorkInProgressHook')
    }

    currentHook = nextCurrentHook

    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,

      next: null,
    }

    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    } else {
      workInProgressHook = workInProgressHook.next = newHook
    }
  }

  return workInProgressHook
}

function enqueueUpdate<S, A>(queue: UpdateQueue<S, A>, update: Update<S, A>) {
  console.log('-enqueueUpdate-', clone(update))

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
  console.log('-dispatchSetState-', clone(fiber))

  const update: Update<S, A> = {
    action,
    next: null,
  }

  enqueueUpdate(queue, update)

  const root = scheduleUpdateOnFiber(fiber)
}

function mountReducer<S, I, A>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (initialArg: I) => S,
): [S, Dispatch<A>] {
  console.log('-mountReducer-', clone(reducer))

  const hook = mountWorkInProgressHook()

  console.log('-mountWorkInProgressHook- return', clone(hook))

  let initialState: S

  if (init !== undefined) {
    initialState = init(initialArg)
  } else {
    initialState = initialArg as unknown as S
  }

  hook.memoizedState = hook.baseState = initialState

  const queue: UpdateQueue<S, A> = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: reducer,
    lastRenderedState: initialState,
  }

  hook.queue = queue

  if (currentlyRenderingFiber === null) {
    throw Error('mountReducer')
  }

  const dispatch = (queue.dispatch = dispatchSetState.bind<
    null,
    [Fiber, UpdateQueue<S, A>],
    any[],
    void
  >(null, currentlyRenderingFiber, queue))

  return [hook.memoizedState, dispatch]
}

function updateReducer<S, I, A>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init?: (initialArg: I) => S,
): [S, Dispatch<A>] {
  console.log('-updateReducer-', clone(reducer))

  const hook = updateWorkInProgressHook()

  console.log('-updateWorkInProgressHook- return', clone(hook))

  const queue = hook.queue

  if (queue === null) {
    throw new Error('updateReducer')
  }

  queue.lastRenderedReducer = reducer

  // 当前hook
  const current: Hook | null = currentHook

  if (current === null) {
    throw Error('updateReducer')
  }

  // 更新链表
  let baseQueue = current.baseQueue

  // 循环链表
  const pendingQueue = queue.pending

  // 将pending链接到baseQueue
  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      const baseFirst = baseQueue.next
      const pendingFirst = pendingQueue.next

      baseQueue.next = pendingFirst
      pendingQueue.next = baseFirst
    }

    current.baseQueue = baseQueue = pendingQueue
    queue.pending = null
  }

  if (baseQueue !== null) {
    const first = baseQueue.next
    let newState = current.baseState

    let newBaseState = null
    let newBaseQueueFirst: Update<S, A> | null = null
    let newBaseQueueLast: Update<S, A> | null = null
    let update = first

    do {
      if (update === null) break

      if (newBaseQueueLast !== null) {
        const clone: Update<S, A> = {
          action: update.action,
          next: null,
        }

        newBaseQueueLast = (newBaseQueueLast as Update<S, A>).next = clone
      }

      const action = update.action
      newState = reducer(newState, action)

      update = update.next
    } while (update !== null && update !== first)

    if (newBaseQueueLast === null) {
      newBaseState = newState
    } else {
      newBaseQueueLast.next = newBaseQueueFirst
    }

    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast

    queue.lastRenderedState = newState
  }

  const dispatch: Dispatch<A> = queue.dispatch
  return [hook.memoizedState, dispatch]
}

function mountState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
  console.log('-mountState-', clone(initialState))

  const hook = mountWorkInProgressHook()

  console.log('-mountWorkInProgressHook- return', clone(hook))

  if (typeof initialState === 'function') {
    initialState = (initialState as () => S)()
  }

  hook.memoizedState = hook.baseState = initialState

  const queue: UpdateQueue<S, BasicStateAction<S>> = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  }

  hook.queue = queue

  if (currentlyRenderingFiber === null) {
    throw Error('mountState')
  }

  const dispatch = (queue.dispatch = dispatchSetState.bind<
    null,
    [Fiber, UpdateQueue<S, BasicStateAction<S>>],
    any[],
    void
  >(null, currentlyRenderingFiber, queue))

  return [hook.memoizedState, dispatch]
}
function basicStateReducer<S>(state: S, action: BasicStateAction<S>): S {
  return typeof action === 'function'
    ? (action as (prev: S) => S)(state)
    : action
}

function updateState<S>(initialState: (() => S) | S): [S, Dispatch<S>] {
  return updateReducer(basicStateReducer, initialState)
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
  useReducer: mountReducer,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
  useReducer: updateReducer,
}

export function renderWithHooks(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props) => any,
  props: Props,
) {
  console.log('-renderWithHooks-', clone(workInProgress))

  currentlyRenderingFiber = workInProgress

  workInProgress.memoizedState = null
  workInProgress.updateQueue = null

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate

  // ! 执行Component调用hooks,即调用ReactCurrentDispatcher.current
  let children = Component(props)

  currentlyRenderingFiber = null

  currentHook = null
  workInProgressHook = null

  return children
}
