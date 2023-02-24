import { useState } from 'react'

export function App() {
  const [num, setNum] = useState(100)
  return <div onClick={() => setNum((pre) => pre + 1)}>{num}</div>
}

function Child() {
  return <span>Child</span>
}
