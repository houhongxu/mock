// import App from './App.tsx'
// import './index.css'
import { useReducer } from 'react'
import { createRoot } from 'react-dom/client'

let timer: number

interface State {
  count: number
}

type Action = { type: 'increment' }

const initialState = { count: 0 }

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

function Button() {
  const [state, dispatch] = useReducer(reducer, initialState)

  if (!timer) {
    timer = window.setTimeout(() => {
      console.log('====================更新====================')

      dispatch({ type: 'increment' })
    }, 1000)
  }

  return <div>{state.count}</div>
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
