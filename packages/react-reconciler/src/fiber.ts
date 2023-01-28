import { Key, Props, Ref } from 'shared/ReactTypes'
import { Flags, NoFlags } from './fiberFlags'
import { WorkTag } from './workTags'

export class FiberNode {
  tag: WorkTag
  key: Key
  type: any
  stateNode: any
  ref: Ref

  return: FiberNode | null
  sibling: FiberNode | null
  child: FiberNode | null
  index: number

  pendingProps: Props
  memoizedProps: Props
  alternate: FiberNode | null
  flags: Flags

  constructor(tag: WorkTag, pendingProps: Props, key: Key) {
    // ! 实例化
    this.tag = tag
    this.key = key
    // 例如 HostComponent <div></div> 则stateNode保存div的DOM
    this.stateNode = null
    // 例如 FunctionComponent 的函数本身
    this.type = null

    // ! 构成树状结构
    // 指向父FiberNode，return后由下一个工作单元执行，即父FiberNode
    this.return = null
    // 右兄弟FiberNode
    this.sibling = null
    this.child = null
    // 例如 <ul><li><li></ul>，则第一个li的index为0，第二个li为1
    this.index = 0

    this.ref = null

    // ! 作为工作单元
    // 工作处理前的props
    this.pendingProps = pendingProps
    // 工作处理后的props
    this.memoizedProps = null
    this.alternate = null

    // 副作用
    this.flags = NoFlags
  }
}
