export type WorkTag =
  | typeof FunctionComponent
  | typeof HostRoot
  | typeof HostComponent
  | typeof HostText

export const FunctionComponent = 0
// Host是宿主环境的意思，例如浏览器是DOM
export const HostRoot = 3
export const HostComponent = 5
export const HostText = 6
