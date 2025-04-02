import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from "./Components/Auth/Login"
import Signup from "./Components/Auth/Signup"
import Main from './Components/MainPage/Main'
import Navbar from './Components/Navbar/Navbar'
import axios from 'axios'

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

// Move fetchUser inside a component inside <Router>
function AppRoutes() {
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
      <Route path='/chat/' element={<><Navbar /><Main /></>} />
    </Routes>
  );
}

export default App;
