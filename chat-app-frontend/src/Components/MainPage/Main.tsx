import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatSideBar from "./ChatSideBar";

export default function Main() {
    const navigate = useNavigate();
    const [user, setUser] = useState("");
    const [wsMessage, setWsMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [reciever,setreciever] = useState("");
    const socketRef = useRef<WebSocket | null>(null);
    const [users, setUsers] = useState<string[]>([]);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("http://localhost:8080/isloggedin", { withCredentials: true });
                setUser(response.data.user);
            } catch (error) {
                console.error("Error fetching user:", error);
                navigate("/auth/login");
            }
        };
        fetchUser();
        const fetchusers =async () => {
            try {
                const response = await axios.get("http://localhost:8080/api/users", { withCredentials: true });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        fetchusers();
    }, []);
    const formConnection = async () => {
        const socket = new WebSocket(`ws://localhost:8080/ws`);
        socketRef.current = socket;
    
        socket.addEventListener("open", () => {
            console.log("WebSocket connected");
        });
    
        socket.addEventListener("message", (event) => {
            console.log("Message received:", event.data);
            setMessages(prevMessages => [...prevMessages, event.data]);
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
    formConnection();
}, [user]);

const sendMessage = () => {
    if(!socketRef.current) {
        formConnection();
    
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageData = JSON.stringify({
            sender: user,
            reciever: reciever,
            message: wsMessage,
            });
        console.log("Sending message:", messageData);
        socketRef.current.send(messageData);
        setWsMessage("");
    } else {
        console.error("WebSocket is not open");
    }
};

    return (
        <div>
            <ChatSideBar users={users}/>
            <div className="ml-96">
            <select value={reciever} onChange={(e) => setreciever(e.target.value)}>
                {users.map((user) => (
                    <option key={user} value={user}>
                        {user}
                    </option>
                ))}
            </select>
            <input type="text" value={wsMessage} onChange={(e) => setWsMessage(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            </div>
        </div>
    );
}