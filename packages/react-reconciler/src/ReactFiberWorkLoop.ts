import { FiberNode, createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { completeWork } from './ReactFiberCompleteWork'
import { SyncLane } from './ReactFiberLane'
import { FiberRootNode } from './ReactFiberRoot'
import { HostRoot } from './ReactWorkTags'

type RootExitStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

const RootInProgress = 0
const RootFatalErrored = 1
const RootErrored = 2
const RootSuspended = 3
const RootSuspendedWithDelay = 4
const RootCompleted = 5
const RootDidNotComplete = 6

let workInProgressRoot: FiberRootNode | null = null

let workInProgress: FiberNode | null = null

let workInProgressRootExitStatus: RootExitStatus = RootInProgress

function markUpdateLaneFromFiberToRoot(fiber: FiberNode) {
  if (fiber.tag === HostRoot) {
    return fiber.stateNode
  }
}

function completeUnitOfWork(unitOfWork: FiberNode) {
  let completedWork = unitOfWork

  workInProgress = null

  do {
    const current = completedWork.alternate

    completeWork(current)

    workInProgress = null

    return
  } while (completedWork !== null)
}

function performUnitOfWork(unitOfWork: FiberNode) {
  let next: FiberNode | null

  next = beginWork(unitOfWork)
  console.log(unitOfWork, next)

  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }
}

function prepareFreshStack(root: FiberRootNode) {
  const rootWorkInProgress = createWorkInProgress(root.current, null)

  workInProgress = rootWorkInProgress
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function renderRootSync(root: FiberRootNode) {
  if (workInProgressRoot !== root) {
    prepareFreshStack(root)
  }

  do {
    try {
      workLoopSync()
      break
    } catch (thrownValue) {
      console.warn('workLoopSync')
    }
  } while (true)

  return workInProgressRootExitStatus
}

function performSyncWorkOnRoot(root: FiberRootNode) {
  let exitStatus = renderRootSync(root)

  if (exitStatus === RootDidNotComplete) {
    throw Error('这是bug')
  }

  const finishedWork = root.current.alternate

  root.finishedWork = finishedWork

  // root.finishedLanes = lanes;

  // commitRoot(root)

  // ensureRootIsScheduled(root)

  return null
}

function ensureRootIsScheduled(root: FiberRootNode) {
  const newCallbackPriority = SyncLane

  if (newCallbackPriority === SyncLane) {
    performSyncWorkOnRoot(root)
  } else {
    // performConcurrentWorkOnRoot()
  }
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
  // fiber root
  const root = markUpdateLaneFromFiberToRoot(fiber)

  // markRootUpdated(root, lane)

  ensureRootIsScheduled(root)
}