import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Fib from './Fib'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import {OtherPage} from './OtherPage'

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className='App-header'>
          <img src={viteLogo} className="logo" alt="Vite logo" />
          <img src={reactLogo} className="logo" alt="React logo" />
          <h1 className="App-title">Welcome to React</h1>
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Routes>
            <Route path="/otherpage" element={<OtherPage />} />
            <Route path="/" element={<Fib />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
