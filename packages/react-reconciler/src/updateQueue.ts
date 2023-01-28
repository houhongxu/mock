import { Action } from 'shared/ReactTypes'

export interface Update<State> {
  action: Action<State>
}

export interface UpdateQueue<State> {
  shared: {
    pending: Update<State> | null
  }
}

/**
 * 创建Update实例
 */
export function createUpdate<State>(action: Action<State>): Update<State> {
  return {
    action
  }
}

/**
 * 创建Update实例队列
 */
export function createUpdateQueue<Action>(): UpdateQueue<Action> {
  return {
    shared: {
      pending: null
    }
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
