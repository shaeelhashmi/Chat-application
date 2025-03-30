import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Main() {
    const navigate = useNavigate();
    const [user, setUser] = useState("");
    const [wsMessage, setWsMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);
    const [reciever,setreciever] = useState("");
    const socketRef = useRef<WebSocket | null>(null);

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

      
    }, [navigate]);
    useEffect(() => {
        if (user === "abcd") setreciever("abcdef");
        if (user === "abcdef") setreciever("abcd");
    }, [user]);   
useEffect(() => {
    if (!user || !reciever) return; // Don't create WebSocket if user is empty
    
    if (user=='abcd')setreciever('abcdef');
    if (user=='abcdef')setreciever('abcd');
    console.log("UserName:", user);
    console.log("Receiver:", reciever);
    const socket = new WebSocket(`ws://localhost:8080/ws?sender=${user}&receiver=${reciever}`);
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
}, [user]);

const sendMessage = () => {
    if(!socketRef.current) {
        const socket= new WebSocket(`ws://localhost:8080/ws?sender=${user}&receiver=${reciever}`);
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
    
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        const messageData =wsMessage;
        console.log("Sending message:", messageData);
        socketRef.current.send(messageData);
        setWsMessage("");
    } else {
        console.error("WebSocket is not open");
    }
};

    return (
        <div>
            <select value={reciever} onChange={(e) => setreciever(e.target.value)}>
                <option value="abcd">abcd</option>
                <option value="abcdef">abcdef</option>
            </select>
            <button onClick={() => {
                axios.get("http://localhost:8080/auth/logout", { withCredentials: true })
                    .then(() => navigate("/auth/login"))
                    .catch((err) => console.error("Logout error:", err));
            }}>Logout</button>
            <input type="text" value={wsMessage} onChange={(e) => setWsMessage(e.target.value)} />
            <button onClick={sendMessage}>Send</button>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
        </div>
    );
}