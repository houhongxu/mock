import { Fiber, createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import { commitMutationEffects } from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import { MutationMask, NoFlags } from './ReactFiberFlags'
import { SyncLane } from './ReactFiberLane'
import { FiberRoot } from './ReactFiberRoot'
import { HostRoot } from './ReactWorkTags'
import { clone } from 'shared/clone'

type RootExitStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6

const RootInProgress = 0
const RootFatalErrored = 1
const RootErrored = 2
const RootSuspended = 3
const RootSuspendedWithDelay = 4
const RootCompleted = 5
const RootDidNotComplete = 6

let workInProgressRoot: FiberRoot | null = null

let workInProgress: Fiber | null = null

let workInProgressRootExitStatus: RootExitStatus = RootInProgress

function markUpdateLaneFromFiberToRoot(fiber: Fiber) {
  if (fiber.tag === HostRoot) {
    return fiber.stateNode as FiberRoot
  }

  return null
}

function completeUnitOfWork(unitOfWork: Fiber) {
  console.log('(completeUnitOfWork)')

  let completedWork: Fiber | null = unitOfWork

  do {
    const current = completedWork.alternate
    const returnFiber: Fiber | null = completedWork.return

    let next: Fiber | null

    console.log('------ completeWork ------')
    next = completeWork(current, completedWork)

    console.log('(completeWork) return', clone(next))
    console.log('--------------------------')

    if (next !== null) {
      workInProgress = next
      return
    }

    // 兄
    const siblingFiber = completedWork.sibling

    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }

    // 父
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null)

  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted
  }
}

function performUnitOfWork(unitOfWork: Fiber) {
  console.log('(performUnitOfWork)', clone(unitOfWork))

  const current = unitOfWork.alternate

  let next: Fiber | null

  // 子
  console.log('------ beginWork ------')
  next = beginWork(current, unitOfWork)

  // old props = new props
  unitOfWork.memoizedProps = unitOfWork.pendingProps

  console.log('(beginWork) return', clone(next))
  console.log('-----------------------')

  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }
}

function prepareFreshStack(root: FiberRoot) {
  console.log('(prepareFreshStack)')
  const rootWorkInProgress = createWorkInProgress(root.current, null)

  console.log('(createWorkInProgress) return', clone(rootWorkInProgress))

  workInProgress = rootWorkInProgress
  workInProgressRoot = root
}

function workLoopSync() {
  console.log('(workLoopSync)', clone(workInProgress))

  while (workInProgress !== null) {
    try {
      performUnitOfWork(workInProgress)
    } catch (e) {
      console.error('performUnitOfWork', e)
      break
    }
  }

  console.log('(workLoopSync) finish')
}

function renderRootSync(root: FiberRoot) {
  console.log('(renderRootSync)')

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

  workInProgressRoot = null

  return workInProgressRootExitStatus
}

function commitRootImpl(root: FiberRoot) {
  const finishedWork = root.finishedWork

  if (finishedWork === null) {
    return null
  }

  root.finishedWork = null

  if (root === workInProgressRoot) {
    workInProgressRoot = null
    workInProgress = null
  }

  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasEffects || rootHasEffect) {
    // beforeMutation
    // commitBeforeMutationEffects()

    // mutation
    commitMutationEffects(root, finishedWork)

    root.current = finishedWork

    // layout
    // commitLayoutEffects()
  } else {
  }
}

function commitRoot(root: FiberRoot) {
  console.log('(commitRoot)')

  try {
    commitRootImpl(root)
  } finally {
  }

  return null
}

function performSyncWorkOnRoot(root: FiberRoot) {
  console.log('(performSyncWorkOnRoot)')

  let exitStatus = renderRootSync(root)

  if (exitStatus === RootDidNotComplete) {
    throw Error('performSyncWorkOnRoot')
  }

  const finishedWork = root.current.alternate

  root.finishedWork = finishedWork

  console.log('====== finishedWork ======', clone(root))

  commitRoot(root)

  // ensureRootIsScheduled(root)

  return null
}

function ensureRootIsScheduled(root: FiberRoot) {
  console.log('(ensureRootIsScheduled)', clone(root))

  const newCallbackPriority = SyncLane

  if (newCallbackPriority === SyncLane) {
    performSyncWorkOnRoot(root)
  } else {
    // performConcurrentWorkOnRoot()
  }
}

export function scheduleUpdateOnFiber(fiber: Fiber) {
  console.log('(scheduleUpdateOnFiber)', clone(fiber))

  // fiber root
  const root = markUpdateLaneFromFiberToRoot(fiber)

  if (root === null) {
    
  // markRootUpdated(root, lane)

  ensureRootIsScheduled(root)
}
