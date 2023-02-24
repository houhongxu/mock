// 合成事件

import { Container } from 'hostConfig'
import { Props } from 'shared/ReactTypes'

// 内部props的属性名
export const elementPropsKey = '__props'

export interface DOMElement extends Element {
  [elementPropsKey]: Props
}

type EventCallback = (e: Event) => void

// 自定义的事件传递
interface Paths {
  capture: EventCallback[]
  bubble: EventCallback[]
}

// 因为需要取消自定义的事件传递，所以需要合成事件
interface SyntheticEvent extends Event {
  __stopPropagation: boolean
}

const validEventTypeList = ['click']

/**
 * 在DOM上更新React的props
 */
export function updateFiberProps(node: DOMElement, props: Props) {
  node[elementPropsKey] = props
}

/**
 * 初始化事件，合成事件代理在container
 */
export function initEvent(container: Container, eventType: string) {
  if (!validEventTypeList.includes(eventType)) {
    console.warn('当前不支持', eventType, '事件')
    return
  }

  if (__DEV__) {
    console.warn('初始化事件：', eventType)
  }

  container.addEventListener(eventType, (e) => {
    dispatchEvent(container, eventType, e)
  })
}

/**
 * 处理自定义事件
 */
function dispatchEvent(container: Container, eventType: string, e: Event) {
  // 收集冒泡途径的所有事件
  const targetElement = e.target

  if (targetElement === null) {
    console.error('事件不存在target', e)
    return
  }

  const { capture, bubble } = collectPaths(
    targetElement as DOMElement,
    container,
    eventType
  )

  // 创建合成事件
  const se = createSyntheticEvent(e)
  // 遍历capture
  triggerEventFlow(capture, se)

  if (!se.__stopPropagation) {
    // 遍历bubble
    triggerEventFlow(bubble, se)
  }
}

/**
 * 收集冒泡途径的所有事件
 */
function collectPaths(
  targetElement: DOMElement,
  container: Container,
  eventType: string
) {
  const paths: Paths = {
    capture: [],
    bubble: []
  }

  while (targetElement && targetElement !== container) {
    const elementProps = targetElement[elementPropsKey]

    if (elementProps) {
      const callbackNameList = getEventCallbackNameFromEventType(eventType)

      if (callbackNameList) {
        callbackNameList.forEach((callbackName, i) => {
          const eventCallback = elementProps[callbackName]
          if (eventCallback) {
            if (i === 0) {
              paths.capture.unshift(eventCallback)
            } else {
              paths.bubble.push(eventCallback)
            }
          }
        })
      }
    }

    targetElement = targetElement.parentNode as DOMElement
  }

  return paths
}

/**
 * 获取事件的回调名数组
 */
function getEventCallbackNameFromEventType(
  eventType: string
): string[] | undefined {
  return {
    click: ['onClickCapture', 'onClick']
  }[eventType]
}

/**
 * 创建合成事件
 */
function createSyntheticEvent(e: Event) {
  const SyntheticEvent = e as SyntheticEvent
  SyntheticEvent.__stopPropagation = false
  const originStopPropagation = e.stopPropagation

  SyntheticEvent.stopPropagation = () => {
    SyntheticEvent.__stopPropagation = true
    if (originStopPropagation) {
      originStopPropagation()
    }
  }
  return SyntheticEvent
}

/**
 * 遍历事件
 */
function triggerEventFlow(paths: EventCallback[], se: SyntheticEvent) {
  for (let i = 0; i < paths.length; i++) {
    const callback = paths[i]
    callback.call(null, se)

    // 如果阻止事件传递就跳出循环
    if (se.__stopPropagation) {
      break
    }
  }
}
