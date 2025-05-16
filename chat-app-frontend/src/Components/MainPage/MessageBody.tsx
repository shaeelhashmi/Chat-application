import SendMsg from "../SVG/SendMsg";
import { useState,useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";
import DeleteMessageBtn from "./DeleteMessageBtn";
interface Message {
  sender: string;
  reciever: string;
  message: string;
  created_at: string;
  id: number;
}
export default function MessageBody() {
  const params = useParams<{ id?: string }>();
const reciever = params.id || "";
const [Messages, setMessages] = useState("")
const [MessagesList, setMessagesList] = useState<Message[] | null>([]);
const [user, setUser] = useState("");
const navigate = useNavigate();
const socketRef = useRef<WebSocket | null>(null);
const onDelete = (id: number) => {
  setMessagesList((prevMessages) => prevMessages?.filter((message) => message.id !== id) || []);
}
const recieveMessages= async ()=>{
  try {
  const response=await axios.get(`http://localhost:8080/api/messages?reciever=${reciever}`,{withCredentials:true})
  console.log(response.data);
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
      useEffect(() => {
   
      }, [MessagesList]); 
useEffect(() => { 
  console.log(params.id);
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
        socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
};

  return (
  < >
   
    <div className=" h-full   mt-14 p-2 ml-[3%] w-full">
      {MessagesList?.map((message:any, index) => (
        <div key={index} className={`flex  mt-4 ${message.sender==user?"justify-end":""}`}>
          <div className={`bg-[#cbcbff] text-black p-4 rounded-lg w-[50%] `}>
            <div className="flex justify-between">
              <p>{message.message}</p>
              <DeleteMessageBtn id={message.id} onDelete={onDelete}/>
              </div>
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
