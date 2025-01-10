// import App from './App.tsx'
// import './index.css'
import { createRoot } from 'react-dom/client'

function Button() {
  return <div>button</div>
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
