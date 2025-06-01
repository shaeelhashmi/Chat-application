import SendMsg from "../SVG/SendMsg";
import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DeleteMessageBtn from "./DeleteMessageBtn";
import { useDispatch, useSelector } from "react-redux";
import { setPage } from "../Slice/CurrentPage";
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
  const dispatch = useDispatch();
  const [user,setUser]=useState("")
  const selector=useSelector((state:any)=>state.userName)
  const params = useParams<{ id?: string }>();
const reciever = params.id || "";
const [Messages, setMessages] = useState("")
const [length, setLength] = useState(0);
useEffect(() => {
  dispatch(setPage(reciever));
},[reciever]);
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
   (async () => {
    await recieveMessages();
    }
    )()
    setUser(selector.userName)
}, [selector]);
useEffect(() => {
  if (length !== props.MessagesList?.length && length!=0) {
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 100;
    console.log( window.innerHeight + window.scrollY, document.body.scrollHeight);
    if (isAtBottom) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    }
    return
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
  setLength(props.MessagesList?.length || 0);
},[props.MessagesList]);

const sendMessage = async() => {
    if(!props.socketRef.current) {
       throw "Websocket is not initialized"
    }
    if (props.socketRef.current && props.socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            type: "message",
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

   
    <div className=" h-full   mt-20 p-2 ml-[3%] w-full ">
      {props.MessagesList?.map((message: any, index:number) => (
        <div key={index} className={`flex mt-4 mb-4 ${message.sender == user ? "justify-end" : ""} sm:text-base xsm:text-sm text-xs`}>
          <div
        className={`bg-[#2C2C2C] text-[#FFF] p-4 rounded-lg w-[50%] break-words whitespace-pre-wrap`}
        style={{ wordBreak: "break-word" }}
          >
        <div className="flex justify-between">
          <p className="break-words whitespace-pre-wrap">{message.message}</p>
         {message.sender == user &&  <DeleteMessageBtn id={message.id} onDelete={onDelete} />}
        </div>
        <div>
          <p className="text-xs italic font-light text-end font-mono">{new Date(message.created_at).toLocaleString()}</p>
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
        <button className={` hover:bg-slate-200 transition-all  p-4 rounded-md duration-500 ${Messages.trim()==""?" hidden":""} relative `} onClick={sendMessage}><SendMsg></SendMsg></button>
        </div>
        </div>
      </div>
  
    </div>
    
    </>
  )
}
