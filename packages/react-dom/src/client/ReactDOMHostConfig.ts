import { updateFiberProps } from './ReactDOMComponentTree'
import { createElement } from './ReactDomComponent'
import { Instance, Props } from 'shared/ReactTypes'

export function createInstance(type: string, props: Props) {
  const domElement = createElement(type)

  updateFiberProps(domElement, props)

  return domElement
}

export function appendInitialChild(
  parentInstance: Instance,
  child: Instance,
): void {
  console.log(parentInstance, child)

  parentInstance.appendChild(child)
}
