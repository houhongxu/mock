import { Fiber } from './ReactFiber'
import assign from 'shared/assign'

export const UpdateState = 0
export const ReplaceState = 1
export const ForceUpdate = 2
export const CaptureUpdate = 3

export type Update<State> = {
  tag: 0 | 1 | 2 | 3

  payload: ((prevState: State | null, nextProps: any) => void) | null | State
  next: Update<State> | null
}

export type SharedQueue<State> = {
  pending: Update<State> | null
}

export type UpdateQueue<State> = {
  baseState: State | null
  firstBaseUpdate: Update<State> | null
  lastBaseUpdate: Update<State> | null
  shared: SharedQueue<State>
}

export function initializeUpdateQueue<State>(fiber: Fiber) {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState as State | null,
    firstBaseUpdate: null, // 链表头
    lastBaseUpdate: null, // 链表尾
    shared: {
      pending: null, // 循环链表，指向最后插入的更新
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

export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  console.log('(enqueueUpdate)')

  const updateQueue = fiber.updateQueue

  if (updateQueue === null) return

  const sharedQueue = updateQueue.shared

  const pending = sharedQueue.pending

  if (pending === null) {
    // 初始化循环链表
    update.next = update
  } else {
    // 插入update到循环链表中
    update.next = pending.next

    pending.next = update
  }

  // 始终指向最新的update
  sharedQueue.pending = update
}

function getStateFromUpdate<State>(
  workInProgress: Fiber,
  queue: UpdateQueue<State>,
  update: Update<State>,
  prevState: State | null,
  nextProps: any,
) {
  const payload = update.payload
  let partialState

  if (typeof payload === 'function') {
    partialState = (
      payload as (prevState: State | null, nextProps: any) => void
    )(prevState, nextProps)
  } else {
    partialState = payload
  }

  return assign({}, prevState, partialState)
}

export function processUpdateQueue<State>(workInProgress: Fiber, props: any) {
  console.log('(processUpdateQueue)')

  const queue: UpdateQueue<State> | null = workInProgress.updateQueue

  if (queue === null) return

  let firstBaseUpdate = queue.firstBaseUpdate
  let lastBaseUpdate = queue.lastBaseUpdate

  let pendingQueue = queue.shared.pending

  if (pendingQueue !== null) {
    queue.shared.pending = null

    // pending始终指向最新更新
    const lastPendingUpdate = pendingQueue
    // 循环链表最新更新的下一个就是第一个更新
    const firstPendingUpdate = lastPendingUpdate.next
    // 断开循环
    lastPendingUpdate.next = null

    // 将pending链接到updateQueue
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate
    } else {
      lastBaseUpdate.next = firstPendingUpdate
    }

    // updateQueue更新
    if (firstBaseUpdate !== null) {
      let newState = queue.baseState

      let newBaseState = null
      let newFirstBaseUpdate = null
      let newLastBaseUpdate = null

      let update = firstBaseUpdate

      do {
        newState = getStateFromUpdate(
          workInProgress,
          queue,
          update,
          newState,
          props,
        )

        if (update.next === null) {
          pendingQueue = queue.shared.pending

          if (pendingQueue === null) {
            break
          }
        } else {
          update = update.next
        }
      } while (true)

      if (newLastBaseUpdate === null) {
        newBaseState = newState
      }

      queue.baseState = newBaseState
      queue.firstBaseUpdate = newFirstBaseUpdate
      queue.lastBaseUpdate = newLastBaseUpdate

      workInProgress.memoizedState = newState
    }
  }
}
