// import App from './App.tsx'
// import './index.css'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

console.log(createElement)
console.log(
  <div>
    <span>im react</span>
  </div>,
)

createRoot(document.getElementById('root')!).render(
  <div>
    <span>im react</span>
  </div>,
)
