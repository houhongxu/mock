import {
  createContainer,
  updateContainer
} from 'react-reconciler/src/fiberReconciler'
import { ReactElement } from 'shared/ReactTypes'
import { Container } from './hostConfig'
import { initEvent } from './SyntheticEvent'

/**
 * 生成应用的根fiberNode并返回渲染react组件的函数
 */
export function createRoot(container: Container) {
  const root = createContainer(container)

  return {
    render(element: ReactElement) {
      initEvent(container, 'click')
      return updateContainer(element, root)
    }
  }
}
