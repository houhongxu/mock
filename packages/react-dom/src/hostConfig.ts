export type Container = Element
export type Instance = Element

/**
 * 创建DOM
 */
export function createInstance(type: string, props: any): Instance {
  // TODO 处理props
  const element = document.createElement(type)
  return element
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
