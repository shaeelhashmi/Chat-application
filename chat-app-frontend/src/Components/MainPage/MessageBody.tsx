import SendMsg from "../SVG/SendMsg";
import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DeleteMessageBtn from "./DeleteMessageBtn";
import { useSelector } from "react-redux";
interface Message {
  sender: string;
  reciever: string;
  message: string;
  created_at: string;
  id: number;
}
interface prop{
  setMessagesList:React.Dispatch<React.SetStateAction<Message[] | null>>
  MessagesList:Message[] | null
  socketRef:React.RefObject<WebSocket|null>
  sessionID:string
}
export default function MessageBody(props:prop) {
  const [user,setUser]=useState("")
  const selector=useSelector((state:any)=>state.userName)
  const params = useParams<{ id?: string }>();
const reciever = params.id || "";
const [Messages, setMessages] = useState("")

const onDelete = (id: number) => {
   if(!props.socketRef.current) {
       throw "Websocket is not initialized"
    }
    if (props.socketRef.current && props.socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: props.sessionID,
            reciever: reciever,
            message: "",
            deleteID: id,
            });
        props.socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
}
const recieveMessages= async ()=>{
  try {
  const response=await axios.get(`http://localhost:8080/api/messages?reciever=${reciever}`,{withCredentials:true})
  console.log(response.data)
  props.setMessagesList(response.data);
  }
  catch (error) {
    console.log("Error fetching messages:", error);
  }
}


useEffect(() => { 
  console.log(params.id);
   (async () => {
    await recieveMessages();
    }
    )()
    setUser(selector.userName)
    console.log(user)
}, [selector]);

const sendMessage = async() => {
    if(!props.socketRef.current) {
       throw "Websocket is not initialized"
    }
    if (props.socketRef.current && props.socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: props.sessionID,
            reciever: reciever,
            message: Messages,
            deleteID: -1
            });
        props.socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
};

  return (
  < >
   
    <div className=" h-full   mt-14 p-2 ml-[3%] w-full">
      {props.MessagesList?.map((message: any, index:number) => (
        <div key={index} className={`flex mt-4 ${message.sender == user ? "justify-end" : ""}`}>
          <div
        className={`bg-[#dafdc0] text-black p-4 rounded-lg w-[50%] break-words whitespace-pre-wrap`}
        style={{ wordBreak: "break-word" }}
          >
        <div className="flex justify-between">
          <p className="break-words whitespace-pre-wrap">{message.message}</p>
          <DeleteMessageBtn id={message.id} onDelete={onDelete} />
        </div>
        <div>
          <p className="text-xs italic font-light text-end">{new Date(message.created_at).toLocaleString()}</p>
        </div>
          </div>
        </div>
      ))}

      <div className="fixed bottom-0 lg:w-[75%] w-[80%] mx-auto">
        <div className="grid grid-cols-[1fr,5%] bg-white ">
        <div>
        <textarea
          className="border border-gray-300 w-full py-1 px-2 resize-none outline-none bg-gray-200"
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
        <button className={` bg-[#d7ffb6] hover:bg-[#c3ff92] transition-all  p-4 rounded-md duration-500 ${Messages.trim()==""?" hidden":""} relative left-5`} onClick={sendMessage}><SendMsg></SendMsg></button>
        </div>
        </div>
      </div>
  
    </div>
    
    </>
  )
}
