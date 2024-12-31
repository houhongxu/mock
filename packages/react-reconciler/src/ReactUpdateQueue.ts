import { Fiber } from './ReactFiber'

export type State = {
  element: any
}

export type Update<State> = {
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

export function initializeUpdateQueue<State>(fiber: Fiber) {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState as State,
    shared: {
      pending: null,
    },
  }
}

export function createUpdate() {}

export function enqueueUpdate(fiber: Fiber, update: Update<State>) {}

function getStateFromUpdate(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  prevState: State,
  nextProps: any,
) {
  return prevState
}

export function processUpdateQueue(workInProgress: Fiber, props: any) {
  const queue = workInProgress.updateQueue

  let pendingQueue = queue?.shared.pending

  if (queue !== null && pendingQueue !== null) {
    queue.shared.pending = null

    let newState = queue.baseState

    newState = getStateFromUpdate(workInProgress, queue, newState, props)

    workInProgress.memoizedState = newState
  }
}
