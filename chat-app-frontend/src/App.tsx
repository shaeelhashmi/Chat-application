import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from "./Components/Auth/Login"
import Signup from "./Components/Auth/Signup"
import Main from './Components/MainPage/Main'
import Navbar from './Components/Navbar/Navbar'
import axios from 'axios'
import { useEffect, useState } from 'react'
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

// Move fetchUser inside a component inside <Router>
function AppRoutes() {
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
      
    
      const fetchusers =async () => {
          try {
              const response = await axios.get("http://localhost:8080/api/users", { withCredentials: true });
              setUsers(response.data);
          } catch (error) {
              console.error("Error fetching users:", error);
          }
      }
      fetchusers();
  }, []);
  
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
      navigate("/chat");
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/auth/login");
    }
  };

  return (
    <Routes>
      <Route path='/auth/login' element={<Login func={fetchUser} />} />
      <Route path='/auth/signup' element={<Signup func={fetchUser} />} />
      <Route path='/chat/' element={<><Navbar users={users}/><Main /></>} />
    </Routes>
  );
}

export default App;
