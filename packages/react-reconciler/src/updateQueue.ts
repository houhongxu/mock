import { Dispatch } from 'react/src/currentDispatcher'
import { Action } from 'shared/ReactTypes'

export interface Update<State> {
  action: Action<State>
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null
  }
  dispatch: Dispatch<State> | null // 保存hook的dispatch
}

/**
 * 创建Update实例，将ReactElement保存在action中
 * @description 更新链表TODO
 */
export function createUpdate<State>(action: Action<State>): Update<State> {
  return {
    action
  }
}

/**
 * 创建Update实例队列
 */
export function createUpdateQueue<State>(): UpdateQueue<State> {
  // ? 这种数据格式为什么可以wip与current共用，因为指向更新环装链表
  return {
    shared: {
      pending: null
    },
    dispatch: null
  }
}

/**
 * Update实例队列增加Update
 */
export function enqueueUpdate<Action>(
  updateQueue: UpdateQueue<Action>,
  update: Update<Action>
) {
  updateQueue.shared.pending = update
}

/**
 * Update实例队列消费Update
 */
export function processUpdateQueue<State>(
  baseState: State,
  pendingUpdate: Update<State> | null
): { memoizedState: State } {
  const result: ReturnType<typeof processUpdateQueue<State>> = {
    memoizedState: baseState
  }

  if (pendingUpdate !== null) {
    // 例如
    // baseState:1 update:2 -> memoizedUpdate:2
    // baseState:1 update:(prev)=>4prev -> memoizedUpdate:4

    const action = pendingUpdate.action

    if (action instanceof Function) {
      // 如果更新方式是回调函数
      result.memoizedState = action(baseState)
    } else {
      // 如果更新方式是新状态
      result.memoizedState = action
    }
  }

  return result
}
