import SendMsg from "../SVG/SendMsg";
import { useState,useEffect,useRef } from "react";
interface propsInterface{
 reciever:string;
 user:string
}
export default function MessageBody(props:propsInterface) {
const [Messages, setMessages] = useState("")
const [MessagesList, setMessagesList] = useState<any[]>([]);
const messages = [
  { text: "Hello, how are you?", sender: "receiver" },
  { text: "I'm good, thanks! How about you?", sender: "sender" },
  { text: "I'm doing well, thanks for asking.", sender: "receiver" },
  { text: "Hey! I'm good too, just working on some projects.", sender: "sender" },
  { text: "I'm working on a chat application using React and TypeScript.", sender: "receiver" },
  { text: "That's great to hear! What projects are you working on?", sender: "sender" },
  { text: "Hello, how are you?", sender: "receiver" },
  { text: "I'm good, thanks! How about you?", sender: "sender" },
];
const socketRef = useRef<WebSocket | null>(null);
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
    formConnection();
}, [props.user]);

const sendMessage = () => {
    if(!socketRef.current) {
        formConnection();
    
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: props.user,
            reciever: props.reciever,
            message: Messages,
            });
        console.log("Sending message:", messageData);
        socketRef.current.send(messageData);
        setMessages("");
    } else {
        console.error("WebSocket is not open");
    }
};

  return (
    < >
    <div className=" h-full   mt-20 p-2 ml-[3%]">
      {messages.map((message, index) => (
        <div key={index} className={`flex  mt-4 ${message.sender=="sender"?"justify-end":""}`}>
          <div className={`bg-[#141474] text-white p-4 rounded-lg w-[50%] `}>{message.text}</div>
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
