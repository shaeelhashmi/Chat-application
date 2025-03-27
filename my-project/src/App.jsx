import Login from './Components/Auth/Login';
import Signup from './Components/Auth/SignUp';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
export default function App() {
  useEffect(() => {
    axios.get('http://localhost:8080', {
      Message: 'Hello World'
    }).then((res) => {
      console.log(res)
    }
    ).catch((err) => {
      console.log(err)
    })
  })
  return (
    <Router>
    <Routes>
    <Route path='/auth/login' element={<Login></Login>}></Route>
    <Route path='/auth/signup' element={<Signup></Signup>}></Route>

    </Routes>
    </Router>
  )
}