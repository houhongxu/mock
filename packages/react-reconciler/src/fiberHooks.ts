import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import internals from 'shared/internals'
import { Action } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  UpdateQueue
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

// 当前渲染函数组件对应的fiberNode
let currentlyRenderingFiber: FiberNode | null = null
// 当前调用的hook
let workInProgressHook: Hook | null = null

// 获取内部共享数据层的指针
const { currentDispatcher } = internals

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

export function renderWithHooks(wip: FiberNode) {
  // 记录当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = wip
  // 初始化指向hook链表的属性
  wip.memoizedState = null

  const current = wip.alternate

  if (current !== null) {
    // ! update
  } else {
    // ! mount
    // 内部共享数据层的指针指向当前节点的hook集合
    currentDispatcher.current = HooksDispatcherOnMount
  }

  // 获取组件函数
  const Component = wip.type
  // 获取组件的属性
  const props = wip.pendingProps
  // 执行函数得到子ReactElement
  const children = Component(props)

  // 重置当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = null

  return children
}

/**
 * mount阶段的hook集合
 */
const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

/**
 * mount阶段的useState
 */
function mountState<State>(
  initialState: () => State | State
): [State, Dispatch<State>] {
  // 获取当前useState对应的hook
  const hook = mountWorkInProgressHook()

  let memoizedState

  // 处理用户传入的状态
  if (initialState instanceof Function) {
    memoizedState = initialState()
  } else {
    memoizedState = initialState
  }

  // 获取更新队列实例
  const queue = createUpdateQueue<State>()
  hook.updateQueue = queue

  // 用户只用传action
  // @ts-ignore
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)

  return [memoizedState, dispatch]
}

/**
 * 接入更新流程
 */
function dispatchSetState<State>(
  fiber: FiberNode,
  updateQueue: UpdateQueue<State>,
  action: Action<State>
) {
  // 创建更新实例
  const update = createUpdate(action)
  // 压入更新实例到更新队列
  enqueueUpdate(updateQueue, update)
  // 开始更新fiberNode
  scheduleUpdateOnFiber(fiber)
}

/**
 * mount阶段当前调用的hook
 */
function mountWorkInProgressHook(): Hook {
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null
  }

  if (workInProgressHook === null) {
    // mount时 是第一个hook 不在当前渲染的fiberNode内调用
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件内调用hook')
    } else {
      // 记录当前渲染的函数组件的hook
      workInProgressHook = hook
      // fiberNode记录当前渲染的函数组件的hook
      currentlyRenderingFiber.memoizedState = workInProgressHook
    }
  } else {
    // mount时 是后续的hook

    // next指向后一个hook
    workInProgressHook.next = hook
    // workInProgressHook指向后一个hook
    workInProgressHook = hook
  }

  return workInProgressHook
}
