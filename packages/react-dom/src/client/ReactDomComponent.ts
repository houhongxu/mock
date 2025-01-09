export function createElement(type: string) {
  let domElement = document.createElement(type)

  return domElement
}

export function createTextNode(text: string) {
  return document.createTextNode(text)
}
