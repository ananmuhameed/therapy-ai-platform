import {HashRouter, Routes, Route} from 'react-router-dom'
import './index.css'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'

function App() {
  return (
   <HashRouter>
    <Routes>    
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    
   </HashRouter>
  )
}

export default App
