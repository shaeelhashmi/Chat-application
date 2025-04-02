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
const [MessagesList, setMessagesList] = useState<Message[] | null>([]);
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
       
useEffect(() => { 
   (async () => {
    await fetchUser();
    await recieveMessages();
    await formConnection();
    }
    )()
}, [user]);

const sendMessage = () => {
    if(!socketRef.current) {
      console.log("Socket is not initialized, creating a new one.");
        formConnection();
    
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: user,
            reciever: reciever,
            message: Messages,
            });
        console.log("Sending message:", messageData);
        setMessagesList(prevMessages => [...(prevMessages||[]), { sender: user, reciever, message: Messages, created_at: new Date().toISOString() }]);
        socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
};

  return (
    reciever==""?
    <>
    <div className="mt-20 flex justify-center items-center flex-col text-white p-3 ">
    <div className="my-5 bg-gradient-to-r from-slate-500 to-purple-200 text-transparent bg-clip-text text-5xl font-bold">
      <h1>Welcome to We Chat</h1>
    </div>
    <div className="my-5"><p className="text-base" >Select a chat to start messaging</p></div>
    </div>
    </>
    :< >
    <div className=" h-full   mt-20 p-2 ml-[3%]">
      {MessagesList?.map((message, index) => (
        <div key={index} className={`flex  mt-4 ${message.sender==user?"justify-end":""}`}>
          <div className={`bg-[#141474] text-white p-4 rounded-lg w-[50%] `}>
            <div><p>{message.message}</p></div>
            <div><p className="text-sm font-light text-end">{new Date(message.created_at).toLocaleString()}</p></div></div>
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        </div >
        <div className=" border-none items-center content-center flex justify-center ">
        <button className={` bg-white hover:bg-[#e2e1e1] transition-all p-3 rounded-md duration-500 ${Messages.trim()==""?" hidden":""}`} onClick={sendMessage}><SendMsg></SendMsg></button>
        </div>
        </div>
      </div>
  
    </div>
    
    </>
  )
}
