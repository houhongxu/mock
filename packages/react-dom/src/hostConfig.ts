import { FiberNode } from 'react-reconciler/src/fiber'
import { HostComponent, HostText } from 'react-reconciler/src/workTags'
import { Props } from 'shared/ReactTypes'
import { DOMElement, updateFiberProps } from './SyntheticEvent'

export type Container = Element
export type Instance = Element
export type TextInstance = Text

/**
 * 创建DOM
 */
export function createInstance(type: string, props: Props): Instance {
  const element = document.createElement(type) as unknown

  updateFiberProps(element as DOMElement, props)

  return element as DOMElement
}

/**
 * 创建TEXT DOM
 */
export function createTextInstance(content: string) {
  return document.createTextNode(content)
}

/**
 * 连接DOM-workInProgress与当前fiberNode对应的DOM
 */
export function appendInitialChild(
  parent: Instance | Container,
  child: Instance
) {
  parent.appendChild(child)
}

/**
 * 连接DOM-workInProgress与当前fiberNode对应的DOM
 */
export function appendChildToContainer(child: Instance, container: Container) {
  container.appendChild(child)
}

/**
 * 消费Update副作用
 */
export function commitUpdate(fiber: FiberNode) {
  switch (fiber.tag) {
    case HostText:
      const text = fiber.memoizedProps.content
      return commitTextUpdate(fiber.stateNode, text)

    default:
      if (__DEV__) {
        console.warn('未实现的Update类型', fiber)
      }
      break
  }
}
/**
 * 消费文本fiberNode的Update副作用
 */
export function commitTextUpdate(textInstance: TextInstance, content: string) {
  textInstance.textContent = content
}

export function removeChild(
  child: Instance | TextInstance,
  container: Container
) {
  container.removeChild(child)
}
