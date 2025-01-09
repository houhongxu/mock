import { updateFiberProps } from './ReactDOMComponentTree'
import { createElement, createTextNode } from './ReactDomComponent'
import { Instance, Props, TextInstance, Type } from 'shared/ReactTypes'

export function createInstance(type: Type, props: Props) {
  const domElement = createElement(type)

  updateFiberProps(domElement, props)

  return domElement
}

export function createTextInstance(text: string) {
  const textNode = createTextNode(text)

  return textNode
}

export function appendInitialChild(
  parentInstance: Instance,
  child: Instance,
): void {
  parentInstance.appendChild(child)
}

export function insertBefore(
  parentInstance: Instance,
  child: Instance | TextInstance,
  beforeChild: Instance | TextInstance,
): void {
  parentInstance.insertBefore(child, beforeChild)
}

export function appendChild(
  parentInstance: Instance,
  child: Instance | TextInstance,
): void {
  parentInstance.appendChild(child)
}
