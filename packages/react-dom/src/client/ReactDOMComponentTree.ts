import { Instance, Props } from 'shared/ReactTypes'

const randomKey = Math.random().toString(36).slice(2)

const internalPropsKey = '__reactProps$' + randomKey

export function updateFiberProps(
  node: Instance & Record<string, Props>,
  props: Props,
) {
  node[internalPropsKey] = props
}
