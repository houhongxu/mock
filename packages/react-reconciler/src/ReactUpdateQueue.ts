import { Fiber } from './ReactFiber'
import assign from 'shared/assign'

export const UpdateState = 0
export const ReplaceState = 1
export const ForceUpdate = 2
export const CaptureUpdate = 3

export type State = {
  element: any
}

export type Update<State> = {
  tag: 0 | 1 | 2 | 3

  payload: any
  next: Update<State> | null
}

export type SharedQueue<State> = {
  pending: Update<State> | null
}

export type UpdateQueue<State> = {
  baseState: State
  shared: SharedQueue<State>
}

export function initializeUpdateQueue(fiber: Fiber) {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState as State,
    shared: {
      pending: null,
    },
  }

  fiber.updateQueue = queue
}

export function createUpdate() {
  console.log('(createUpdate)')

  const update: Update<any> = {
    tag: UpdateState,
    payload: null,
    next: null,
  }

  return update
}

export function enqueueUpdate(fiber: Fiber, update: Update<State>) {
  console.log('(enqueueUpdate)')

  const updateQueue = fiber.updateQueue

  if (updateQueue === null) return

  const sharedQueue = updateQueue.shared

  const pending = sharedQueue.pending

  if (pending === null) {
  } else {
    pending.next = update
  }

  sharedQueue.pending = update
}

function getStateFromUpdate(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State,
  nextProps: any,
) {
  const payload = update.payload
  let partialState

  if (typeof payload === 'function') {
    partialState = payload(prevState, nextProps)
  } else {
    partialState = payload
  }

  return assign({}, prevState, partialState)
}

export function processUpdateQueue(workInProgress: Fiber, props: any) {
  console.log('(processUpdateQueue)')

  const queue = workInProgress.updateQueue

  if (queue === null) return

  let pendingQueue = queue.shared.pending

  if (pendingQueue !== null) {
    const update = pendingQueue
    queue.shared.pending = null

    let newState = queue.baseState

    newState = getStateFromUpdate(
      workInProgress,
      queue,
      update,
      newState,
      props,
    )

    workInProgress.memoizedState = newState
  }
}
