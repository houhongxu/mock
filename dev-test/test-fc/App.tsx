import { useState } from 'react'

export function App() {
  const [num, setNum] = useState(100)
  window.setNum = setNum
  return num === 3 ? <Child></Child> : <div>{num}</div>
}

function Child() {
  return <span>Child</span>
}
