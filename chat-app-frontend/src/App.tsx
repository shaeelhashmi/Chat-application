
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from "./Components/Auth/Login"
import Signup from "./Components/Auth/Signup"
function App() {
  return (
    <Router>
    <Routes>

    <Route path='/auth/login' element={<Login></Login>}></Route>
    <Route path='/auth/signup' element={<Signup></Signup>}></Route>

    </Routes>
    </Router>
  )
}

export default App