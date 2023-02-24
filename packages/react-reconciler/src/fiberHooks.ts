// 处理hook

import { Dispatch, Dispatcher } from 'react/src/currentDispatcher'
import internals from 'shared/internals'
import { Action } from 'shared/ReactTypes'
import { FiberNode } from './fiber'
import {
  createUpdate,
  createUpdateQueue,
  enqueueUpdate,
  processUpdateQueue,
  UpdateQueue
} from './updateQueue'
import { scheduleUpdateOnFiber } from './workLoop'

// 当前渲染函数组件对应的fiberNode
let currentlyRenderingFiber: FiberNode | null = null
// 当前调用的hook
let workInProgressHook: Hook | null = null
// 已经渲染的hook
let currentHook: Hook | null = null

// 获取内部共享数据层的指针
const { currentDispatcher } = internals

interface Hook {
  memoizedState: any
  updateQueue: unknown
  next: Hook | null
}

/**
 * !!! 执行函数组件返回ReactElement并处理hook，提供给用户的hook函数的hook实例保存在fiberNode的memoizedState中
 */
export function renderWithHooks(wip: FiberNode) {
  // 记录当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = wip
  // 初始化指向hook实例链表的属性
  wip.memoizedState = null

  const current = wip.alternate

  // 内部共享数据层的指针指向当前节点的hook集合
  if (current !== null) {
    // ! update，在执行Component()时触发，react包中的resolveDispatcher()拿到此对象调用updateState
    currentDispatcher.current = HooksDispatcherOnUpdate
  } else {
    // ! mount，在执行Component()时触发，react包中的resolveDispatcher()拿到此对象调用mountState
    currentDispatcher.current = HooksDispatcherOnMount
  }

  // 获取组件函数
  const Component = wip.type
  // 获取组件的属性
  const props = wip.pendingProps
  // ! 执行函数得到子ReactElement，执行函数时会调用现在保存在内存的hook函数
  const children = Component(props)

  // 重置当前渲染的函数组件对应的fiberNode
  currentlyRenderingFiber = null

  return children
}

/**
 * ! mount阶段的hook集合
 */
const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState
}

/**
 * mount阶段的useState
 * @description mount时用户拿到的useState，保存在内存中，当触发dispactch时调用dispatchSetState()
 */
function mountState<State>(
  initialState: () => State | State
): [State, Dispatch<State>] {
  // 获取当前useState对应的hook实例
  const hook = mountWorkInProgressHook()

  let memoizedState

  // 处理用户传入的状态
  if (initialState instanceof Function) {
    memoizedState = initialState()
  } else {
    memoizedState = initialState
  }
  // 保存用户传入的状态
  hook.memoizedState = memoizedState

  // 创建更新队列实例
  const queue = createUpdateQueue<State>()
  hook.updateQueue = queue

  // 用户只用传action
  // @ts-ignore
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue)

  queue.dispatch = dispatch

  return [memoizedState, dispatch]
}

/**
 * mount阶段当前调用的hook
 */
function mountWorkInProgressHook(): Hook {
  // 新建hook实例
  const hook: Hook = {
    memoizedState: null,
    updateQueue: null,
    next: null
  }

  // 保存hook实例给fiberNode
  if (workInProgressHook === null) {
    // mount时 是第一个hook实例，不在当前渲染的fiberNode内调用
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件内调用hook')
    } else {
      // 记录当前渲染的函数组件的hook实例
      workInProgressHook = hook
      // ! fiberNode记录当前渲染的函数组件的hook实例
      currentlyRenderingFiber.memoizedState = workInProgressHook
    }
  } else {
    // mount时 是后续的hook实例，获取后一个hook实例
    workInProgressHook.next = hook
    // workInProgressHook指向后一个hook
    workInProgressHook = hook
  }

  return workInProgressHook
}

/**
 * 接入更新流程
 * @desciption 更新后从这里开始调用
 * @description 改变的updateQueue是mountState()函数中新建的hook中的，新hook同步保存在currentlyRenderingFiber的memoizedState中
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
 * ! update阶段的hook集合
 */
const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState
}

/**
 * update阶段的useState
 * @desciption 消费用户传入的更新，并将新hook实例对应的hook函数给用户
 */
function updateState<State>(): [State, Dispatch<State>] {
  // 获取当前useState对应的hook实例
  const hook = updateWorkInProgressHook()

  // 获取需要更新的更新实例
  const queue = hook.updateQueue as UpdateQueue<State>
  const pending = queue.shared.pending

  if (pending !== null) {
    // 获取更新后的状态
    const { memoizedState } = processUpdateQueue(hook.memoizedState, pending)
    // 更新状态
    hook.memoizedState = memoizedState
  }

  return [hook.memoizedState, queue.dispatch as Dispatch<State>]
}

/**
 * !!! update阶段当前调用的hook
 * @description 可能会复用mount阶段的hook实例给复用的fiberNode
 */
function updateWorkInProgressHook(): Hook {
  // TODO render阶段触发的更新
  let nextCurrentHook: Hook | null

  if (currentHook === null) {
    // update时 是第一个hook实例，获取fiberNode-current
    const current = currentlyRenderingFiber?.alternate
    // 获取已渲染的hook实例
    if (current !== null) {
      // ! update
      nextCurrentHook = current?.memoizedState
    } else {
      // ! mount 进入这里则出现错误
      nextCurrentHook = null
    }
  } else {
    // update时 是后续的hook实例，获取后一个hook实例
    nextCurrentHook = currentHook.next
  }

  if (nextCurrentHook === null) {
    // ! mount阶段进入update，或者当更新时hook函数多了一个拿不到mount时的hook实例
    throw new Error(
      `组件${currentlyRenderingFiber?.type}本次执行时的Hook比上次执行时多`
    )
  }

  // 复用hook实例
  currentHook = nextCurrentHook as Hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    updateQueue: currentHook.updateQueue,
    next: null
  }

  // 保存新hook实例给此时的FiberNode-workInProgress
  if (workInProgressHook === null) {
    // mount时 是第一个hook实例，不在当前渲染的fiberNode内调用
    if (currentlyRenderingFiber === null) {
      throw new Error('请在函数组件内调用hook')
    } else {
      // 记录当前渲染的函数组件的hook
      workInProgressHook = newHook
      // fiberNode记录当前渲染的函数组件的hook
      currentlyRenderingFiber.memoizedState = workInProgressHook
    }
  } else {
    // mount时 是后续的hook实例，获取后一个hook实例
    workInProgressHook.next = newHook
    // workInProgressHook指向后一个hook
    workInProgressHook = newHook
  }

  return workInProgressHook
}
