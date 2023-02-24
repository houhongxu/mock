import {
  createContainer,
  updateContainer
} from 'react-reconciler/src/fiberReconciler'
import { ReactElement } from 'shared/ReactTypes'
import { Container } from './hostConfig'

/**
 * 生成应用的根fiberNode并返回渲染react组件的函数
 */
export function createRoot(container: Container) {
  const root = createContainer(container)

  if (__DEV__) {
    console.log('应用的container', container)
    console.log('应用的根fiberNode', root)
  }

  return {
    render(element: ReactElement) {
      if (__DEV__) {
        console.log('需要渲染的React根组件', element)
      }
      return updateContainer(element, root)
    }
  }
}
