import './App.css'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Login from "./Components/Auth/Login"
import Signup from "./Components/Auth/Signup"
import Navbar from './Components/Navbar/Navbar'
import SentRequest from './Components/Requests/SentRequest'
import axios from 'axios'
import ChatSideBar from './Components/MainPage/ChatSideBar'
import MessageBody from './Components/MainPage/MessageBody'
import { setUsername } from './Components/Slice/UserName'
import { useDispatch } from 'react-redux'

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

  const dispatch = useDispatch()
  const fetchUserName = async () => {
    try {
        const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
        dispatch(setUsername(response.data.user))
    } catch (error) {
        console.error("Error fetching user:", error);
    }
  };
  useEffect(() => {
      
    
      const fetchusers =async () => {
          try {
              const response = await axios.get("http://localhost:8080/api/users", { withCredentials: true });
              setUsers(response.data);
          } catch (error) {
              console.error("Error fetching users:", error);
          }
      }
      fetchUserName();
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
      <Route path='/chat' element={
      <>
      <Navbar users={users}/>     
      <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
      <ChatSideBar users={users}/>
      <MessageBody  ></MessageBody>
      </div>
       </>} />
      <Route path='/requests/sent' element={
      <>
      <Navbar users={users}/>
      <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
      <ChatSideBar users={users}/>
      <SentRequest  ></SentRequest>
      </div>
      </>
    } 
    />
    </Routes>
  );
}

export default App;
