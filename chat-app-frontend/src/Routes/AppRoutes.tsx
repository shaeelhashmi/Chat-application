import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUsername } from '../Components/Slice/UserName'
import Login    from '../Components/Auth/Login';
import Signup from '../Components/Auth/Signup';
import Navbar from '../Components/Navbar/Navbar';
import SentRequest from '../Components/Requests/SentRequest';
import ChatSideBar from '../Components/MainPage/ChatSideBar';
import MessageBody from '../Components/MainPage/MessageBody';
import HomePage from '../Components/MainPage/HomePage';
import RecievedRequest from '../Components/Requests/RecievedRequest';
import Settings from '../Components/Settings/Settings';
import ChangeUserName from '../Components/Settings/ChangeUserName';
import ChangePassword from '../Components/Settings/ChangePassword';
import SettingSideBar from '../Components/Settings/SideBar/SettingSideBar';
import FriendSetting from '../Components/Friends/FriendSetting';
import Activitylog from '../Components/Settings/Activity/Activitylog';
export default function AppRoutes() {
    const [users, setUsers] = useState<string[]>([]);
    const [friends,setFriends] = useState<any[]>([]);
  
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
    const navigate = useNavigate();
  
    const fetchUser = async () => {
      try {
        await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
        if (window.location.href === 'http://localhost:5173/auth/login' || window.location.href === 'http://localhost:5173/auth/signup') {
          navigate("/chat");
        }
      } catch (error) {
        if (window.location.href !== 'http://localhost:5173/auth/login' && window.location.href !== 'http://localhost:5173/auth/signup') {
          navigate("/auth/login");
        }
      
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
        fetchUser();
  
    }, []);
  
  
    return (
      <Routes>
        <Route path='/auth/login' element={<Login  />} />
        <Route path='/auth/signup' element={<Signup />} />
        
        <Route path='/requests/sent' element={
        <>
        <Navbar users={users}/>
        <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <SentRequest  ></SentRequest>
        
        </div>
        </>
      } 
      />
      <Route path='/settings' element={
        <>
              <Navbar users={users}/>   
              <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <Settings />
              </div>
        </>
        } />
           <Route path='/settings/user' element={
        <>
              <Navbar users={users}/>   
              
              <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <ChangeUserName />
              </div>
        </>
        } />
            <Route path='/settings/password' element={
        <>
              <Navbar users={users}/>   
              <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <ChangePassword />
              </div>
        </>
        } />
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
         <Route path="/friend/:id/:name" element={
        <>
        <Navbar users={users}/>
        <FriendSetting />
        </>} />
          <Route path='/settings/activity' element={
        <>
              <Navbar users={users}/>   
              <div className='grid grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <Activitylog />
              </div>
        </>
        } />

      </Routes>
    );
}
