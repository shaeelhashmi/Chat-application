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
import HomePage from './Components/MainPage/HomePage'
import { useEffect, useState } from 'react'
import RecievedRequest from './Components/Requests/RecievedRequest'
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
  const [friends,setFriends] = useState<string[]>([]);

  const dispatch = useDispatch()
  const fetchFriends = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/friends", { withCredentials: true });
        setFriends(response.data);
    } catch (error) {
        console.error("Error fetching friends:", error);
    }
  }

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
      fetchFriends();
  }, []);
  useEffect(() => {
    console.log("Friends updated:", friends);
  }, [friends]);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
      navigate("/chat");
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  return (
    <Routes>
      <Route path='/auth/login' element={<Login func={fetchUser} />} />
      <Route path='/auth/signup' element={<Signup func={fetchUser} />} />
      
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
    <Route path='/chat/:id' element={
      <>
      <Navbar users={users}/>     
      <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
      <ChatSideBar users={friends}/>
      <MessageBody  ></MessageBody>
      </div>
       </>} />
       <Route path='/chat' element={
      <>
      <Navbar users={users}/>     
      <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
      <ChatSideBar users={friends}/>
      <HomePage  ></HomePage>
      </div>
       </>} />
       <Route path='/requests/recieved' element={
      <>
      <Navbar users={users}/>     
      <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
      <ChatSideBar users={friends}/>
      <RecievedRequest  ></RecievedRequest>
      </div>
       </>} />
    </Routes>
  );
}

export default App;
