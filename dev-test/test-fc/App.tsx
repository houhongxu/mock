import { useState } from 'react'

export function App() {
  const [num, setNum] = useState(100)
  window.setNum = setNum
  return <div>{num}</div>
}

function Child() {
  return <span>hhx</span>
}
