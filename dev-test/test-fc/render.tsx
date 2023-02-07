import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div>
      <Child />
    </div>
  )
}
function Child() {
  return <span>hhx</span>
}

export const render = () =>
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
  )

// ? 条件守卫，通过接受热更新的模块来渲染，还有其他方式吗?组件放入单独文件？
if (import.meta.hot) {
  import.meta.hot.accept((mod) => mod.render())
}
