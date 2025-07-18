import { useEffect, useState,useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUsername } from '../Components/Slice/UserName'
import Login    from '../Components/Auth/Login';
import Signup from '../Components/Auth/Signup';
import Navbar from '../Components/Navbar/Navbar';
import SentRequest from '../Components/Requests/SentRequest';
import ChatSidebar from '../Components/MainPage/ChatSidebar';
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
import PageDistribution from '../Components/Util/PageDistribution';
import Profile from '../Components/ProfileInfo/Profile';
import ChangeFullName from '../Components/Settings/ChangeFullName';
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
    const [online, setOnlineUsers] = useState<string[]>([]);
   const socketRef = useRef<WebSocket | null>(null);

   /*For sockets*/
   const [MessagesList, setMessagesList] = useState<Message[] | null>([]);
   const [sessionID,setSessionId]=useState<string>("")
   const getSessionID=async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/session", { withCredentials: true });
      setSessionId(response.data.sessionID);
    } catch (error) {
      console.error("Error fetching session ID:", error);
    }
   }
  const formConnection = async () => {
        const socket = new WebSocket(`ws://localhost:8080/`);
        socketRef.current = socket;
        socket.addEventListener("message", (event) => {
            
            
            let parsedData = JSON.parse(event.data)
  
            if (parsedData.deleteId)
            {           
                setMessagesList(prevMessages => prevMessages?.filter(message => message.id !== parsedData.deleteId) || []);
                return;
            }
            if (parsedData.type ==="message")
            {
            
            if (!parsedData.toSender)
            {
            new Notification('Message recieved', {
              body: `Message from ${parsedData.sender}: ${parsedData.message}`,
            });
          }
            setMessagesList(prevMessages => [...(prevMessages || []), parsedData]);
        } else if (parsedData.type === "onlineUsers") {
          setOnlineUsers(parsedData.OnlineUsers);
        }
        });
        
    
        socket.addEventListener("close", () => {
        });
    
        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
        });
     
        socket.addEventListener("open", () => {
          const testMessage = JSON.stringify({
            type: "test",
            sender: sessionID,
            
          });

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
          
      } catch (error) {
          console.error("Error fetching user:", error);
      }
    };
    const navigate = useNavigate();
  
    const fetchUser = async () => {
      try {
        await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
        if (window.location.href === 'http://localhost:5173/auth/login' || window.location.href === 'http://localhost:5173/auth/signup' || window.location.href === 'http://localhost:5173/') {
          navigate("/chat");
        }
      } catch (error) {
        if (window.location.href !== 'http://localhost:5173/auth/login' && window.location.href !== 'http://localhost:5173/auth/signup') {
          navigate("/auth/login");
        }
      
      }
    };
     const RemoveFriend=async(id:string|undefined,name:string|undefined)=>{
    try {
      await axios.delete(`http://localhost:8080/friend/remove?friendid=${id}&friendname=${name}`, {withCredentials:true});

    }
    catch (error) {
      console.error("Error removing friend:", error);
    }
  }
  const handleBlock=async(id:string|undefined,name:string|undefined)=>{
    try {
      if (!id || !name) {
        console.error("Invalid id or name for blocking friend");
        return;
      }
   await axios.get(`http://localhost:8080/block?friendship_id=${id}&friend_name=${name}`, {withCredentials:true});
    }
    catch (error) {
      console.error("Error blocking friend:", error);
    }
  }
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
        getSessionID();
        

  
    }, []);

    useEffect(() => {
      if (!sessionID) {
        return;
      }
      
      formConnection()
    },[sessionID])
  
  
    return (
      
      <Routes>
        <Route path='/auth/login' element={<Login  />} />
        <Route path='/auth/signup' element={<Signup />} />
        
        <Route path='/requests/sent' element={
        <>
        <Navbar users={users} socket={socketRef}/>
        <PageDistribution  text={
          <> 
        <ChatSidebar removeFriend={RemoveFriend} handleBlock={handleBlock} users={friends}/>
        <SentRequest  ></SentRequest>
        </>}
        />
        </>
      } 
      />
      <Route path='/settings' element={
        <>
              <Navbar users={users} socket={socketRef}/>   
                <PageDistribution  text={
          <> 
              <SettingSideBar />
              <Settings />
        </>
        }
        />
        </>
        } />
           <Route path='/settings/user' element={
        <>
              <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={
             <>
              <SettingSideBar />
              <ChangeUserName />
              </>
              }
        />
             
        </>
        } />
            <Route path='/settings/password' element={
        <>
              <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={
              <>
              <SettingSideBar />
              <ChangePassword />
              </>
           
              }></PageDistribution>
        </>
        } />
      <Route path='/chat/:id' element={
        <>
        <Navbar users={users} socket={socketRef}/>     
        <PageDistribution text={
          <>
          <ChatSidebar removeFriend={RemoveFriend} handleBlock={handleBlock} users={friends}/>
        <MessageBody  setMessagesList={setMessagesList} MessagesList={MessagesList} socketRef={socketRef} sessionID={sessionID}></MessageBody></>
        } />

         </>} />
         <Route path='/chat' element={
        <>
        <Navbar users={users} socket={socketRef}/>   
        <PageDistribution text={<>
            <ChatSidebar removeFriend={RemoveFriend} handleBlock={handleBlock} users={friends}/>
        <HomePage  socket={socketRef} sessionID={sessionID} onlineUsers={online}></HomePage>
        </>}/>  
         </>} />
         <Route path='/requests/recieved' element={
        <>
          <Navbar users={users} socket={socketRef}/>    
        <PageDistribution text={<>
            <ChatSidebar removeFriend={RemoveFriend} handleBlock={handleBlock} users={friends}/>
        <RecievedRequest  ></RecievedRequest>
          </>}/>
       

         </>} />
         <Route path="/friend/:id/:name" element={
        <>
        <Navbar users={users} socket={socketRef}/>
        <PageDistribution text={<>
          <ChatSidebar removeFriend={RemoveFriend} handleBlock={handleBlock} users={friends}/>
        <FriendSetting handleBlock={handleBlock} removeFriend={RemoveFriend} />
        </>}/>
        </>} />
          <Route path='/settings/activity' element={
        <>
              <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={<><SettingSideBar />
              <Activitylog /></>}/>
        </>
        } />
        <Route path='/settings/blocked' element={
        <>
              <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={<>
                      <SettingSideBar />
              <BlockedUser ></BlockedUser>
                </>}/>
        </>
        } />
        <Route path='/settings/info' element={
          <>
          <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={<>
                      <SettingSideBar />
              <Profile ></Profile>
                </>}/>
          </>
        }/>
         <Route path='/settings/fullname' element={
          <>
          <Navbar users={users} socket={socketRef}/>   
              <PageDistribution text={<>
                      <SettingSideBar />
              <ChangeFullName ></ChangeFullName>
                </>}/>
          </>
        }/>
        <Route path="*" element={
          <div className='flex justify-center items-center h-screen'>
          <h1 className='text-5xl text-white'>404 - Not Found</h1>
          </div>
        } />

      </Routes>
    );
}
