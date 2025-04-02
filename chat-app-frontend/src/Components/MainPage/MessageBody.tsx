import SendMsg from "../SVG/SendMsg";
import { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
interface Message {
  sender: string;
  reciever: string;
  message: string;
  created_at: string;
}
export default function MessageBody() {
const queryParams = new URLSearchParams(window.location.search);
const reciever = queryParams.get("reciever") || "";
const [Messages, setMessages] = useState("")
const [MessagesList, setMessagesList] = useState<Message[]>([]);
const [user, setUser] = useState("");
const navigate = useNavigate();
const socketRef = useRef<WebSocket | null>(null);
const recieveMessages= async ()=>{
  try {
  const response=await axios.get(`http://localhost:8080/api/messages?reciever=${reciever}`,{withCredentials:true})
  console.log(response.data)
  setMessagesList(response.data);
  }
  catch (error) {
    console.log("Error fetching messages:", error);
  }
}
const fetchUser = async () => {
  try {
      const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
      setUser(response.data.user);
  } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/auth/login");
  }
};
const formConnection = async () => {
        const socket = new WebSocket(`ws://localhost:8080/`);
        socketRef.current = socket;
    
        socket.addEventListener("open", () => {
            console.log("WebSocket connected");
        });
    
        socket.addEventListener("message", (event) => {
            console.log("Message received:", event.data);
            console.log(event.data.data)
            let parsedData = JSON.parse(event.data)
  
            setMessagesList(prevMessages => [...prevMessages,parsedData]);
        });
    
        socket.addEventListener("close", () => {
            console.log("WebSocket disconnected");
        });
    
        socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
        });
    
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
        }  
        useEffect(() => {
          console.log("MessagesList updated:", MessagesList);
          console.log(MessagesList[MessagesList.length-1])
          console.log(MessagesList[MessagesList.length-1])
        },[MessagesList]);
       
useEffect(() => { 
   (async () => {
    await fetchUser();
    await recieveMessages();
    await formConnection();
    }
    )()
}, []);

const sendMessage = () => {
    if(!socketRef.current) {
        formConnection();
    
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: user,
            reciever: reciever,
            message: Messages,
            });
        console.log("Sending message:", messageData);
        setMessagesList(prevMessages => [...prevMessages, { sender: user, reciever, message: Messages, created_at: new Date().toISOString() }]);
        socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
};

  return (
    < >
    <div className=" h-full   mt-20 p-2 ml-[3%]">
      {MessagesList.map((message, index) => (
        <div key={index} className={`flex  mt-4 ${message.sender==user?"justify-end":""}`}>
          <div className={`bg-[#141474] text-white p-4 rounded-lg w-[50%] `}>{message.message}</div>
        </div>
      ))}

      <div className="fixed bottom-0 w-[75%]">
        <div className="grid grid-cols-[1fr,5%] bg-white ">
        <div>
        <textarea
          className="border border-gray-300 w-full py-1 px-2 resize-none outline-none"
          placeholder="Type a message..."
          value={Messages}
          onChange={(e) => setMessages(e.target.value)}
        />
        </div >
        <div className=" border-none items-center content-center flex justify-center ">
        <button className=" bg-white hover:bg-[#e2e1e1] transition-all p-3 rounded-md duration-500" onClick={sendMessage}><SendMsg></SendMsg></button>
        </div>
        </div>
      </div>
  
    </div>
    
    </>
  )
}
