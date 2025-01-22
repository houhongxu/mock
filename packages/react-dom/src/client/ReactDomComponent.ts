export function createElement(type: string) {
  let domElement = document.createElement(type)

  return domElement
}

export function createTextNode(text: string) {
  return document.createTextNode(text)
}

export function diffProperties(
  domElement: Element,
  tag: string,
  lastRawProps: any,
  nextRawProps: any,
) {
  let updatePayload: null | Array<any> = null

  let lastProps
  let nextProps

  return updatePayload
}

export function updateProperties() {}
