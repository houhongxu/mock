// import App from './App.tsx'
// import './index.css'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'

let timer: number

function Button() {
  const [count, setCount] = useState(10086)

  if (!timer) {
    timer = window.setTimeout(() => {
      console.log('====================更新====================')

      setCount((pre) => pre + 1)
    }, 1000)
  }

  return <div>{count}</div>
}

const App = (
  <div>
    <span>
      <Button></Button>
    </span>
  </div>
)

console.log(App)

createRoot(document.getElementById('root')!).render(App)
