import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import Draw from './components/Draw'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-screen h-screen">
      <Draw />
    </div>
  )
}

export default App
