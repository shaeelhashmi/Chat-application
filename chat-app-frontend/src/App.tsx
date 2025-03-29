
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from "./Components/Auth/Login"
import Signup from "./Components/Auth/Signup"
import Main from './Components/MainPage/Main'
function App() {
  return (
    <Router>
    <Routes>

    <Route path='/auth/login' element={<Login></Login>}></Route>
    <Route path='/auth/signup' element={<Signup></Signup>}></Route>
    <Route path='/' element={<Main></Main>}></Route>

    </Routes>
    </Router>
  )
}

export default App