import { useEffect, useState,useRef } from 'react';
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
import BlockedUser from '../Components/Blocked/BlockedUser';
import Activitylog from '../Components/Settings/Activity/Activitylog';
interface Message {
  sender: string;
  reciever: string;
  message: string;
  created_at: string;
  id: number;
}
export default function AppRoutes() {
    const [users, setUsers] = useState<string[]>([]);
    const [friends,setFriends] = useState<any[]>([]);
   const socketRef = useRef<WebSocket | null>(null);

   /*For sockets*/
   const [MessagesList, setMessagesList] = useState<Message[] | null>([]);
   const [user,setUser]=useState<string>("")
  const formConnection = async () => {
        const socket = new WebSocket(`ws://localhost:8080/`);
        socketRef.current = socket;
        socket.addEventListener("message", (event) => {
            
            
            let parsedData = JSON.parse(event.data)
            console.log(parsedData)
            if (!parsedData.toSender)
            {
            new Notification('Hello from your React app!', {
              body: `Message from ${parsedData.sender}: ${parsedData.message}`,
            });
          }
            setMessagesList(prevMessages => [...(prevMessages || []), parsedData]);
        });
    
        socket.addEventListener("close", () => {
            console.log("WebSocket disconnected");
        });
    
        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
        });
     
        socket.addEventListener("open", () => {
          const testMessage = JSON.stringify({
            sender: user,
            reciever: "",
            message: "Test message from socket",
          });
          console.log("Sending test message:", testMessage);
          socket.send(testMessage);
        });
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
        }  
/*For socket*/
        
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
          setUser(response.data.user)
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
    useEffect(() => {
      if(user=="")
      {
        return
      }
      formConnection()
    },[user])
  
  
    return (
      <Routes>
        <Route path='/auth/login' element={<Login  />} />
        <Route path='/auth/signup' element={<Signup />} />
        
        <Route path='/requests/sent' element={
        <>
        <Navbar users={users}/>
       <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <SentRequest  ></SentRequest>
        
        </div>
        </>
      } 
      />
      <Route path='/settings' element={
        <>
              <Navbar users={users}/>   
             <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <Settings />
              </div>
        </>
        } />
           <Route path='/settings/user' element={
        <>
              <Navbar users={users}/>   
              
             <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <ChangeUserName />
              </div>
        </>
        } />
            <Route path='/settings/password' element={
        <>
              <Navbar users={users}/>   
             <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <ChangePassword />
              </div>
        </>
        } />
      <Route path='/chat/:id' element={
        <>
        <Navbar users={users}/>     
       <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <MessageBody  setMessagesList={setMessagesList} MessagesList={MessagesList} socketRef={socketRef}></MessageBody>
        </div>
         </>} />
         <Route path='/chat' element={
        <>
        <Navbar users={users}/>     
        <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <HomePage  ></HomePage>
        </div>
         </>} />
         <Route path='/requests/recieved' element={
        <>
        <Navbar users={users}/>     
         <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <RecievedRequest  ></RecievedRequest>
        </div>
         </>} />
         <Route path="/friend/:id/:name" element={
        <>
        <Navbar users={users}/>
          <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
        <ChatSideBar users={friends}/>
        <FriendSetting />
        </div>
        </>} />
          <Route path='/settings/activity' element={
        <>
              <Navbar users={users}/>   
              <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <Activitylog />
              </div>
        </>
        } />
        <Route path='/settings/blocked' element={
        <>
              <Navbar users={users}/>   
              <div className='grid lg:grid-cols-[20%,1fr] w-[95vw]'>
              <SettingSideBar />
              <BlockedUser ></BlockedUser>
              </div>
        </>
        } />

      </Routes>
    );
}
