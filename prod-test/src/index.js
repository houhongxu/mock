import React from 'react'
import ReactDOM from 'react-dom'

function App() {
  return (
    <div>
      <span>Child</span>
    </div>
  )
}

const root = document.querySelector('#root')

ReactDOM.createRoot(root).render(<App></App>)

console.log(React)
console.log(ReactDOM)
